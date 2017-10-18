
exports.up = function(knex) {
    return knex.schema.createTable('users', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.string('name').unique();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('users');
};
