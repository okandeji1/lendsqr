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
        table.decimal('balance');
        table.timestamps('created_at').defaultTo(knex.fn.now());
        table.timestamps('updated_at').defaultTo(knex.fn.now());
      })
  );
};

exports.down = function (knex) {
  return knex.schema.dropTable('users');
};
