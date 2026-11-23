import { sql, type Kysely } from 'kysely'

/**
 * A user without a row keeps the defaults: the expiry mail is on.
 */
export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('notification_settings')
    .addColumn('user_id', 'text', (column) =>
      column.primaryKey().references('users.id').onDelete('cascade')
    )
    .addColumn('expiry_mail', 'boolean', (column) => column.notNull().defaultTo(true))
    .addColumn('updated_at', 'timestamptz', (column) => column.notNull().defaultTo(sql`now()`))
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('notification_settings').execute()
}
