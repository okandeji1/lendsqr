import { Knex } from 'knex';
// Migrations
export async function up(knex: Knex) {
  return (
    knex.schema
      //   User
      .createTable('users', function (table) {
        table.increments('id');
        table.uuid('uuid').notNullable().unique();
        table.string('name', 255).notNullable();
        table.string('username', 255).unique().notNullable();
        table.string('email').notNullable();
        table.string('password', 255).notNullable();
        table.decimal('balance').notNullable().defaultTo(0);
        table.datetime('created_at', { precision: 6 }).notNullable().defaultTo(knex.fn.now(6));
        table.datetime('updated_at', { precision: 6 }).notNullable().defaultTo(knex.fn.now(6));
      })
  );
}

export async function down(knex: Knex) {
  return knex.schema.dropTable('users');
}
