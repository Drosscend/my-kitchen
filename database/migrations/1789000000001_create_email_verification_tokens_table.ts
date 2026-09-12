import { sql, type Kysely } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('email_verification_tokens')
    .addColumn('id', 'text', (column) => column.primaryKey())
    .addColumn('user_id', 'text', (column) =>
      column.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('email', 'text', (column) => column.notNull())
    .addColumn('token_hash', 'text', (column) => column.notNull().unique())
    .addColumn('expires_at', 'timestamptz', (column) => column.notNull())
    .addColumn('created_at', 'timestamptz', (column) => column.notNull().defaultTo(sql`now()`))
    .execute()

  await db.schema
    .createIndex('email_verification_tokens_user_id_index')
    .on('email_verification_tokens')
    .column('user_id')
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('email_verification_tokens').execute()
}
