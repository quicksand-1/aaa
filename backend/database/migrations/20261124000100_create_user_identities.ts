import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_identities', (table) => {
    table.increments('id');
    table
      .bigInteger('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.string('provider', 32).notNullable();
    table.string('app_id', 64).notNullable();
    table.string('openid', 128).notNullable();
    table.string('unionid', 128).nullable();
    table.boolean('status').notNullable().defaultTo(1);
    table.datetime('last_login_at').nullable();
    table.datetime('created_at').notNullable();
    table.datetime('updated_at').notNullable();
    table.unique(['provider', 'app_id', 'openid'], {
      indexName: 'uk_user_identities_provider_app_openid',
    });
    table.index(['user_id'], 'idx_user_identities_user_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_identities');
}
