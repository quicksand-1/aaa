import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('market_snapshots', (table) => {
    table.string('source', 32).primary();
    // 首次抓取就失败的源没有历史值，payload 必须允许为空
    table.text('payload').nullable();
    table.text('fetched_at').nullable();
    table.text('failed_at').nullable();
    table.text('error').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('market_snapshots');
}
