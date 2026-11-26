import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.increments('id');
    table.string('username', 50).notNullable().unique();
    table.string('name', 50).notNullable().defaultTo('');
    table.string('password_hash', 255).notNullable();
    table.string('role', 20).notNullable().defaultTo('自定义');
    table.boolean('is_admin').notNullable().defaultTo(0);
    table.boolean('status').notNullable().defaultTo(1);
    table.integer('failed_attempts').notNullable().defaultTo(0);
    table.datetime('locked_until').nullable();
    table.boolean('need_modified_pwd').notNullable().defaultTo(1);
    table.datetime('last_login_at').nullable();
    table.datetime('password_changed_at').nullable();
    table.datetime('created_at').notNullable();
    table.datetime('updated_at').notNullable();
  });

  await knex.schema.createTable('user_permissions', (table) => {
    table.increments('id');
    table
      .bigInteger('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.string('module', 20).notNullable();
    table.boolean('can_read').notNullable().defaultTo(0);
    table.boolean('can_edit').notNullable().defaultTo(0);
    table.boolean('can_download').notNullable().defaultTo(0);
    table.datetime('created_at').notNullable();
    table.datetime('updated_at').notNullable();
    table.unique(['user_id', 'module'], {
      indexName: 'uk_user_permissions_user_module',
    });
  });

  await knex.schema.createTable('sessions', (table) => {
    table.increments('id');
    table.string('token_hash', 64).notNullable().unique();
    table
      .bigInteger('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.datetime('expires_at').notNullable();
    table.datetime('last_seen_at').notNullable();
    table.string('ip', 45).nullable();
    table.string('user_agent', 255).nullable();
    table.datetime('created_at').notNullable();
    table.index(['user_id'], 'idx_sessions_user_id');
    table.index(['expires_at'], 'idx_sessions_expires_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('sessions');
  await knex.schema.dropTableIfExists('user_permissions');
  await knex.schema.dropTableIfExists('users');
}
