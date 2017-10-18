
exports.up = function(knex) {
    return knex.schema.createTable('user_items', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('user_id').notNullable();
        table.uuid('item_id').notNullable();
        table.foreign('user_id').references('users.id');
        table.foreign('item_id').references('items.id');
        table.unique(['user_id', 'item_id']);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('user_items');
};
