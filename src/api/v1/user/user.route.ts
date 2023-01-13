import express from 'express';
import * as userController from './user.controller';
import { inputValidator, isAuthenticated } from '../../../util/middleware';
import {
  getUserSchema,
  loginUserSchema,
  registerUserSchema,
  updateUserSchema,
  deleteUserSchema,
} from './user.validator';
export const userRouter = express.Router();

userRouter.post(
  '/register',
  inputValidator({ body: registerUserSchema }),
  userController.registerUser,
);

userRouter.post('/login', inputValidator({ body: loginUserSchema }), userController.loginUser);

userRouter.get(
  '/',
  inputValidator({ query: getUserSchema }),
  isAuthenticated,
  userController.getUsers,
);

userRouter.get('/me', isAuthenticated, userController.getUser);

userRouter.put(
  '/update',
  inputValidator({ body: updateUserSchema }),
  isAuthenticated,
  userController.updateUser,
);

userRouter.delete(
  '/delete',
  inputValidator({ body: deleteUserSchema }),
  isAuthenticated,
  userController.deleteUser,
);
