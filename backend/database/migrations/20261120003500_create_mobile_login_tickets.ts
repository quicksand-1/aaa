import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('mobile_login_tickets', (table) => {
    table.increments('id');
    table.string('token_hash', 64).notNullable().unique();
    table
      .bigInteger('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.datetime('expires_at').notNullable();
    table.datetime('consumed_at').nullable();
    table.string('ip', 45).nullable();
    table.string('user_agent', 255).nullable();
    table.datetime('created_at').notNullable();
    table.index(['user_id'], 'idx_mobile_login_tickets_user_id');
    table.index(['expires_at'], 'idx_mobile_login_tickets_expires_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('mobile_login_tickets');
}
