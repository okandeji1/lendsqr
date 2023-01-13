# Wallet Demo Service

A demo credit service with wallet functionality built with knex.js, Objection.js and TypeScript to perform CRUD operations and transactions on a MySQL database.

## Environment Variable

Create a `.env` file in the root of the project and set the following environment variables:

DATABASE_URL: Your db host
APP_PORT: your port
JWT_SECRET: your secret
PAYSTACK_SECRET: your paystack secret key
TEST_DB: your test db

## Prerequisites

Install yarn

### Build the app

yarn install

### Run the app locally

yarn start:dev

visit http://localhost:8088 to run the service

### Run the app

yarn build

yarn start

## Run the migrations

npx knex migrate:latest --env developmentD

## Usage

Use the service by making requests to the API endpoints

## API Endpoints

- `GET /api/v1/users`: Retrieve a list of all users
- `GET /api/v1/users?username='username'`: Retrieve a single user by username
- `POST /api/v1/users/register`: Create a new user
- `POST /api/v1/users/login`: Login
- `PUT /api/v1/users/update`: Update an existing user using username
- `DELETE /api/v1/users/delete`: Delete an existing user using username
- `POST /api/v1/finances/wallet/deposit/paystack` Initialize paystack checkout page to make payment
- `GET /api/v1/finances/wallet/verify/paystack?reference='reference'` Verify payment with reference to fund wallet
- `POST /api/v1/finances/wallet/transfer/fund` Transfer fund from one user wallet to another user wallet
- `POST /api/v1/finances/wallet/withdraw/fund` Withdraw from wallet to bank with paystack gateway
- `PATCH /api/v1/finances/wallet/fund/user` Fund a user wallet
- `GET /api/v1/transactions`: Retrieve a list of all transactions
- `GET /api/v1/transactions?reference='reference'`: Retrieve a single transaction

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
