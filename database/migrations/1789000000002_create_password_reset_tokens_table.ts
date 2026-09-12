import { sql, type Kysely } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('password_reset_tokens')
    .addColumn('id', 'text', (column) => column.primaryKey())
    .addColumn('user_id', 'text', (column) =>
      column.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('token_hash', 'text', (column) => column.notNull().unique())
    .addColumn('expires_at', 'timestamptz', (column) => column.notNull())
    .addColumn('created_at', 'timestamptz', (column) => column.notNull().defaultTo(sql`now()`))
    .execute()

  await db.schema
    .createIndex('password_reset_tokens_user_id_index')
    .on('password_reset_tokens')
    .column('user_id')
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('password_reset_tokens').execute()
}
