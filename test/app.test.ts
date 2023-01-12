import request from 'supertest';
import { knex } from 'knex';
import { v4 } from 'uuid';
import bcrypt from 'bcrypt';
import { Model } from 'objection';
import { testDb } from '../knexfile';
import app from '../src/app';
import { registerUser } from '../src/api/v1/user/user.controller';

describe('createUser', () => {
  // Database connection
  let db;
  beforeAll(async () => {
    db = knex(testDb);
    Model.knex(db);
  });
  afterAll(async () => {
    await db.destroy();
  });

  it('should insert a new user', async () => {
    const user = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      username: 'johndoe1',
      password: await bcrypt.hash('1234567', 10),
      uuid: v4(),
    };
    // @ts-ignore
    // const res = await request(app).post('/api/v1/users/register', user);
    const result = await registerUser(db, user);
    expect(result).toEqual({ id: expect.any(Number), ...user });
    // check the user is inserted in the db
    const insertedUser = await db('users').where({ email: user.email }).first();
    expect(insertedUser).toEqual({ id: expect.any(Number), ...user });
  });
});

describe('Get Users', () => {
  let db;
  beforeAll(async () => {
    db = knex(testDb);
  });
  afterAll(async () => {
    await db.destroy();
  });
  it('should get all users', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.body).toEqual(['Goon', 'Tsuki', 'Joe']);
  });
});

// Test
