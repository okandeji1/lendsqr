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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
