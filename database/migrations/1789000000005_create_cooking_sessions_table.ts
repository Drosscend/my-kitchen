import { sql, type Kysely } from 'kysely'

/**
 * A session carries a frozen copy of the recipe so a phone without an
 * account can follow it from the six digit code alone.
 */
export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('cooking_sessions')
    .addColumn('code', 'text', (column) => column.primaryKey())
    .addColumn('user_id', 'text', (column) =>
      column.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('recipe', 'jsonb', (column) => column.notNull())
    .addColumn('scale', 'double precision', (column) => column.notNull())
    .addColumn('state', 'jsonb', (column) => column.notNull())
    .addColumn('updated_at', 'timestamptz', (column) => column.notNull().defaultTo(sql`now()`))
    .addColumn('expires_at', 'timestamptz', (column) => column.notNull())
    .execute()

  await db.schema
    .createIndex('cooking_sessions_expires_at_index')
    .on('cooking_sessions')
    .column('expires_at')
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('cooking_sessions').execute()
}
