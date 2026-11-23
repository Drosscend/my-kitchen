import { sql, type Kysely } from 'kysely'

/**
 * The last expiry status mailed for each batch, with the date it was read
 * from.
 */
export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('expiry_notices')
    .addColumn('batch_id', 'text', (column) => column.primaryKey())
    .addColumn('user_id', 'text', (column) =>
      column.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('status', 'text', (column) =>
      column.notNull().check(sql`status in ('expired', 'soon', 'check')`)
    )
    .addColumn('expires_on', 'date', (column) => column.notNull())
    .addColumn('notified_at', 'timestamptz', (column) => column.notNull().defaultTo(sql`now()`))
    .execute()

  await db.schema
    .createIndex('expiry_notices_user_id_index')
    .on('expiry_notices')
    .column('user_id')
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('expiry_notices').execute()
}
