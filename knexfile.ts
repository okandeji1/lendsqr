import * as dotenv from 'dotenv';
dotenv.config();

const config = {
  developmentDb: {
    client: 'mysql',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './src/database/migrations',
      loadExtensions: ['.ts'],
    },
  },
  testDb: {
    client: 'mysql',
    connection: process.env.TEST_DB,
    migrations: {
      directory: './src/database/migrations',
      loadExtensions: ['.ts'],
    },
  },
};

export const { developmentDb, testDb } = config;
