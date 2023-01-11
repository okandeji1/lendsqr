// import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();
// Update with your config settings.
module.exports = {
  client: 'mysql',
  connection: process.env.DATABASE_URL,
  // connection: {
  //   host: '127.0.0.1',
  //   port: 3306,
  //   user: 'root',
  //   password: '',
  //   database: 'lendsqr',
  // },
  migrations: {
    // directory: path.resolve(__dirname, './src/util/migrations'),
    // directory: __dirname + './src/database/migrations',
    // directory: path.resolve(__dirname, './migrations'),
    // directory: './migrations',
    directory: './src/database/migrations',
    loadExtensions: ['.ts'],
  },
};
