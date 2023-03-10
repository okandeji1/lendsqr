import bcrypt from 'bcrypt';
import { v4 } from 'uuid';
import { AppError, catchAsyncError } from '../../../util/appError';
import { generateTokens } from '../../../util/utility';
import { User } from '../../../database/models/user.model';

export const registerUser = catchAsyncError(async (req, res) => {
  const obj = req.body;

  const query = { username: obj.username };

  const user = await User.query().findOne(query);
  //  Check if user exist
  if (user) {
    throw new AppError(
      'user already exist, please use existing account or choose another name',
      400,
    );
  }

  const passwordHash = await bcrypt.hash(obj.password, 10);
  obj.password = passwordHash;
  //   Generate uuid
  obj.uuid = v4();

  const newUser: any = await User.query().insert(obj);

  return res.status(201).json({
    status: true,
    message: 'new user created succefully',
    data: {
      username: newUser.username,
      name: newUser.name,
      id: newUser.uuid,
      createdAt: newUser.created_at,
    },
  });
});

export const loginUser = catchAsyncError(async (req, res) => {
  const obj = req.body;
  const query = {
    username: obj.username,
  };

  const user: any = await User.query().findOne(query);

  if (!user) {
    throw new AppError('user does not exist', 404);
  }

  const isValidPassword = await bcrypt.compare(obj.password, user.password);

  if (!isValidPassword) {
    throw new AppError('your username/password combination is not correct', 401);
  }

  const { accessToken, refreshToken } = generateTokens({
    username: user.username,
    name: user.name,
    email: user.email,
  });

  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  user.password = undefined;

  return res.status(200).json({
    status: true,
    message: 'user logged in successfully',
    data: user,
  });
});

export const getUsers = catchAsyncError(async (req, res) => {
  const obj = req.query;

  const { limit, page } = req.query;

  let query: any = {};
  let objKey: any;
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'limit' || key === 'page') {
      continue;
    }
    objKey = key; // This will take the last key in the loop
    query = { ...query, [key]: value };
  }

  // We would have use a complex query to get data with client query request but the database of choice doesn't allow that so we stick to this.

  if (objKey && query[objKey]) {
    // Get users with client query
    const users: any = await User.query()
      .select('id', 'username', 'name', 'email', 'created_at', 'updated_at')
      .where(objKey, obj[objKey])
      .offset((page - 1) * limit)
      .limit(limit)
      .orderBy('created_at', 'desc');

    return res.status(200).json({
      status: true,
      message: 'found user(s)',
      data: users,
      meta: {
        total: users.length,
        skipped: page * limit,
        perPage: limit,
        page: page,
        pageCount: Math.ceil(users.length / limit),
      },
    });
  }

  const users: any = await User.query()
    .select('id', 'username', 'name', 'email', 'created_at', 'updated_at')
    .offset((page - 1) * limit)
    .limit(limit)
    .orderBy('created_at', 'desc');

  return res.status(200).json({
    status: true,
    message: 'found user(s)',
    data: users,
    meta: {
      total: users.length,
      skipped: page * limit,
      perPage: limit,
      page: page,
      pageCount: Math.ceil(users.length / limit),
    },
  });
});

export const getUser = catchAsyncError(async (req, res) => {
  const query = { username: req.user.username };
  const user: any = await User.query().findOne(query);
  //   We keep user password to ourselves
  user.password = undefined;

  return res.status(200).json({
    status: true,
    message: 'found user(s)',
    data: user,
  });
});

export const updateUser = catchAsyncError(async (req, res) => {
  const obj = req.body;
  const query = {
    username: obj.username,
  };

  const user: any = await User.query().findOne(query);

  if (!user) {
    throw new AppError('user does not exist', 404);
  }

  if (obj.password) {
    const hash = await bcrypt.hash(obj.password, 10);
    obj.password = hash;
  }

  const updatedUser = await user.$query().updateAndFetch(obj);

  if (!updatedUser) {
    throw new AppError('Internal server error', 500);
  }

  updatedUser.password = undefined;

  return res.status(200).json({
    status: true,
    message: 'user updated successfully',
    data: updatedUser,
  });
});

export const deleteUser = catchAsyncError(async (req, res) => {
  const obj = req.body;
  const query = {
    username: obj.username,
  };

  const user: any = await User.query().findOne(query);

  if (!user) {
    throw new AppError('user does not exist', 404);
  }

  const deletedUser = await user.$query().delete();

  if (!deletedUser) {
    throw new AppError('Internal server error', 500);
  }

  return res.status(200).json({
    status: true,
    message: 'user deleted successfully',
    data: null,
  });
});
