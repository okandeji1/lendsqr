// Migrations
exports.up = function (knex) {
  return (
    knex.schema
      //   User
      .createTable('users', function (table) {
        table.increments('id');
        table.string('name', 255).notNullable();
        table.string('username', 255).notNullable();
        table.string('email').unique().notNullable();
        table.string('password', 255).notNullable();
        table.decimal('balance').notNullable().defaultTo(0);
        table.datetime('created_at', { precision: 6 }).notNullable().defaultTo(knex.fn.now(6));
        table.datetime('updated_at', { precision: 6 }).notNullable().defaultTo(knex.fn.now(6));
      })
  );
};

exports.down = function (knex) {
  return knex.schema.dropTable('users');
};
