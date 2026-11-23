import { sql, type Kysely } from 'kysely'

/**
 * One row per device that accepted push notifications. A browser keeps
 * its endpoint, so adding the same device again moves it to the account.
 */
export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('push_subscriptions')
    .addColumn('id', 'text', (column) => column.primaryKey())
    .addColumn('user_id', 'text', (column) =>
      column.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('endpoint', 'text', (column) => column.notNull().unique())
    .addColumn('p256dh', 'text', (column) => column.notNull())
    .addColumn('auth', 'text', (column) => column.notNull())
    .addColumn('label', 'text', (column) => column.notNull())
    .addColumn('created_at', 'timestamptz', (column) => column.notNull().defaultTo(sql`now()`))
    .execute()

  await db.schema
    .createIndex('push_subscriptions_user_id_index')
    .on('push_subscriptions')
    .column('user_id')
    .execute()

  await db.schema
    .alterTable('notification_settings')
    .addColumn('expiry_push', 'boolean', (column) => column.notNull().defaultTo(true))
    .addColumn('security_push', 'boolean', (column) => column.notNull().defaultTo(true))
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema
    .alterTable('notification_settings')
    .dropColumn('expiry_push')
    .dropColumn('security_push')
    .execute()
  await db.schema.dropTable('push_subscriptions').execute()
}
