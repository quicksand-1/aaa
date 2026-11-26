import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('mobile_login_tickets', (table) => {
    table.string('purpose', 32).notNullable().defaultTo('mobile_web');
    table.bigInteger('issuer_session_id').nullable();
    table.index(['user_id', 'purpose'], 'idx_mobile_login_tickets_user_purpose');
    table.index(['issuer_session_id'], 'idx_mobile_login_tickets_issuer_session');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('mobile_login_tickets', (table) => {
    table.dropIndex(['user_id', 'purpose'], 'idx_mobile_login_tickets_user_purpose');
    table.dropIndex(['issuer_session_id'], 'idx_mobile_login_tickets_issuer_session');
    table.dropColumn('purpose');
    table.dropColumn('issuer_session_id');
  });
}
