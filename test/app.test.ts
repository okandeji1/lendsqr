import { describe, test } from '@jest/globals';
import request from 'supertest';
import { knex } from 'knex';
import { Model } from 'objection';
import { testDb } from '../knexfile';
import app from '../src/app';
import assert from 'assert';

describe('Create User', () => {
  // Database connection
  let db;
  beforeAll(async () => {
    db = knex(testDb);
    Model.knex(db);
  });
  afterAll(async () => {
    await db.destroy();
  });

  test('should insert a new user', async () => {
    const user = {
      name: 'John Doe',
      email: 'johndoe30@example.com',
      username: 'johndoe30',
      password: '1234567',
    };

    await request(app)
      .post('/api/v1/users/register')
      .send(user)
      .expect(201)
      .expect(function (res) {
        assert(res.body.hasOwnProperty('status'));
        assert(res.body.hasOwnProperty('message'));
        assert(res.body.hasOwnProperty('data'));
      });
  });
});

describe('Login', () => {
  // Database connection
  let db;
  beforeAll(async () => {
    db = knex(testDb);
    Model.knex(db);
  });
  afterAll(async () => {
    await db.destroy();
  });

  test('should login user', async () => {
    const login = {
      username: 'johndoe30',
      password: '1234567',
    };

    await request(app)
      .post('/api/v1/users/login')
      .send(login)
      .expect(200)
      .expect(function (res) {
        assert(res.body.hasOwnProperty('status'));
        assert(res.body.hasOwnProperty('message'));
        assert(res.body.hasOwnProperty('data'));
      });
  });
});

describe('Get Users', () => {
  let db;
  beforeAll(async () => {
    db = knex(testDb);
    Model.knex(db);
  });
  afterAll(async () => {
    await db.destroy();
  });

  test('should get all users', async () => {
    const login = await loginUser();
    await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${login.accessToken}`)
      .expect(200)
      .expect(function (res) {
        assert(res.body.hasOwnProperty('status'));
        assert(res.body.hasOwnProperty('message'));
        assert(res.body.hasOwnProperty('data'));
      });
  });
});

describe('Update User', () => {
  let db;
  beforeAll(async () => {
    db = knex(testDb);
    Model.knex(db);
  });
  afterAll(async () => {
    await db.destroy();
  });

  test('should update user', async () => {
    const updateData = {
      username: 'johndoe5',
      name: 'john dow',
      email: 'johndow5@gmail.com',
    };

    const login = await loginUser();
    await request(app)
      .put('/api/v1/users/update')
      .send(updateData)
      .set('Authorization', `Bearer ${login.accessToken}`)
      .expect(200)
      .expect(function (res) {
        assert(res.body.hasOwnProperty('status'));
        assert(res.body.hasOwnProperty('message'));
        assert(res.body.hasOwnProperty('data'));
      });
  });
});

describe('Fund User', () => {
  let db;
  beforeAll(async () => {
    db = knex(testDb);
    Model.knex(db);
  });
  afterAll(async () => {
    await db.destroy();
  });

  test('should fund user', async () => {
    const payload = {
      username: 'johndoe5',
      amount: 1000,
    };

    const login = await loginUser();
    await request(app)
      .patch('/api/v1/finances/wallet/fund/user')
      .send(payload)
      .set('Authorization', `Bearer ${login.accessToken}`)
      .expect(200)
      .expect(function (res) {
        assert(res.body.hasOwnProperty('status'));
        assert(res.body.hasOwnProperty('message'));
        assert(res.body.hasOwnProperty('data'));
      });
  });
});

describe('Transfer Fund To User', () => {
  let db;
  beforeAll(async () => {
    db = knex(testDb);
    Model.knex(db);
  });
  afterAll(async () => {
    await db.destroy();
  });

  test('should transfer fund to user', async () => {
    const payload = {
      sender: 'johndoe5',
      beneficiary: 'johndoe3',
      amount: 100,
    };

    const login = await loginUser();
    await request(app)
      .post('/api/v1/finances/wallet/transfer/fund')
      .send(payload)
      .set('Authorization', `Bearer ${login.accessToken}`)
      .expect(200)
      .expect(function (res) {
        assert(res.body.hasOwnProperty('status'));
        assert(res.body.hasOwnProperty('message'));
        assert(res.body.hasOwnProperty('data'));
      });
  });
});

describe('Get Transactions', () => {
  let db;
  beforeAll(async () => {
    db = knex(testDb);
    Model.knex(db);
  });
  afterAll(async () => {
    await db.destroy();
  });

  test('should get transactions', async () => {
    const login = await loginUser();
    await request(app)
      .get('/api/v1/transactions')
      .set('Authorization', `Bearer ${login.accessToken}`)
      .expect(200)
      .expect(function (res) {
        assert(res.body.hasOwnProperty('status'));
        assert(res.body.hasOwnProperty('message'));
        assert(res.body.hasOwnProperty('data'));
      });
  });
});

describe('Delete User', () => {
  let db;
  beforeAll(async () => {
    db = knex(testDb);
    Model.knex(db);
  });
  afterAll(async () => {
    await db.destroy();
  });

  test('should delete user', async () => {
    const deleteData = {
      username: 'johndoe6',
    };

    const login = await loginUser();
    await request(app)
      .delete('/api/v1/users/delete')
      .send(deleteData)
      .set('Authorization', `Bearer ${login.accessToken}`)
      .expect(200)
      .expect(function (res) {
        assert(res.body.hasOwnProperty('status'));
        assert(res.body.hasOwnProperty('message'));
        assert(res.body.hasOwnProperty('data'));
      });
  });
});

describe('Create User', () => {
  let db;
  beforeAll(async () => {
    db = knex(testDb);
    Model.knex(db);
  });
  afterAll(async () => {
    await db.destroy();
  });

  test('should throw an error when email already exists', async () => {
    const user = {
      name: 'John Doe',
      email: 'johndoe1100@example.com',
      username: 'johndoe100',
      password: '1234567',
    };

    await request(app)
      .post('/api/v1/users/register')
      .send(user)
      .expect(201)
      .expect(function (res) {
        assert(res.body.hasOwnProperty('status'));
        assert(res.body.hasOwnProperty('message'));
        assert(res.body.hasOwnProperty('data'));
      });

    await request(app)
      .post('/api/v1/users/register')
      .send(user)
      .expect(201)
      .toThrow(/duplicate key value violates unique constraint/);
  });
});

const loginUser = async () => {
  const data = {
    username: 'johndoe1',
    password: '1234567',
  };

  const res = await request(app).post('/api/v1/users/login').send(data);
  return { accessToken: res.body.data.accessToken };
};
