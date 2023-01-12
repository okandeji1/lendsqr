import { Knex } from 'knex';
// Migrations
export async function up(knex: Knex) {
  return (
    knex.schema
      //   User
      .createTable('users', function (table) {
        table.increments('id');
        table.uuid('uuid').notNullable().unique();
        table.string('name').notNullable();
        table.string('username').unique().notNullable();
        table.string('email').notNullable();
        table.string('password').notNullable();
        table.double('balance').notNullable().defaultTo(0);
        table.datetime('created_at', { precision: 6 }).notNullable().defaultTo(knex.fn.now(6));
        table.datetime('updated_at', { precision: 6 }).notNullable().defaultTo(knex.fn.now(6));
      })
      //NOTE: This model will make the user fetch records as the beneficiary or sender while the admin (if any) get all records
      .createTable('transactions', function (table) {
        table.increments('id');
        table.uuid('uuid').notNullable().unique();
        table.string('reference').unique().notNullable();
        table.double('amount').notNullable().defaultTo(0);
        table.string('source').notNullable();
        table.string('destination').notNullable();
        table.string('status').notNullable();
        table.string('channel').notNullable();
        table.string('paymentGateway').notNullable();
        table.text('narration').notNullable();
        table.string('currency').notNullable();
        table.string('beneficiary').nullable();
        table.string('sender').nullable();
        table.jsonb('beneficiaryHistory').nullable();
        table.jsonb('senderHistory').nullable();
        table.enum('type', ['DEPOSIT', 'WITHDRAW', 'TRANSFER']).notNullable();
        table.datetime('created_at', { precision: 6 }).notNullable().defaultTo(knex.fn.now(6));
        table.datetime('updated_at', { precision: 6 }).notNullable().defaultTo(knex.fn.now(6));
      })
  );
}

export async function down(knex: Knex) {
  return knex.schema.dropTable('users').dropTable('transactions');
}
