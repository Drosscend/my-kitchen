import { sql, type Kysely } from 'kysely'

/**
 * The warning days a user set instead of those of the catalog, per
 * category. A null keeps the catalog value; a category without a row
 * keeps both.
 */
export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('expiry_warnings')
    .addColumn('user_id', 'text', (column) =>
      column.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('category', 'text', (column) => column.notNull())
    .addColumn('perishable_days', 'integer', (column) =>
      column.check(sql`perishable_days between 0 and 365`)
    )
    .addColumn('shelf_stable_days', 'integer', (column) =>
      column.check(sql`shelf_stable_days between 0 and 365`)
    )
    .addPrimaryKeyConstraint('expiry_warnings_pkey', ['user_id', 'category'])
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('expiry_warnings').execute()
}
