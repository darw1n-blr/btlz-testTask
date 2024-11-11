import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('deliverybase', (table) => {
        table.increments('id').primary();
        table.string('warehouse').notNullable();
        table.string('date').notNullable();
        table.float('coef').notNullable();
        table.unique(['warehouse', 'date']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('deliverybase');
}
