import { sql, type Kysely } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('ingredients')
    .addColumn('id', 'text', (column) => column.primaryKey())
    .addColumn('user_id', 'text', (column) =>
      column.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('name', 'text', (column) => column.notNull())
    .addColumn('quantity', 'double precision', (column) => column.notNull())
    .addColumn('unit', 'text', (column) => column.notNull())
    .addColumn('category', 'text', (column) => column.notNull())
    .addColumn('state', 'text', (column) => column.notNull())
    .addColumn('created_at', 'timestamptz', (column) => column.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (column) => column.notNull().defaultTo(sql`now()`))
    .addCheckConstraint('ingredients_quantity_check', sql`quantity >= 0`)
    .addCheckConstraint(
      'ingredients_unit_check',
      sql`unit in ('g', 'kg', 'mL', 'L', 'unit', 'piece')`
    )
    .addCheckConstraint(
      'ingredients_category_check',
      sql`category in ('vegetables', 'fruits', 'meat', 'fish', 'dairy', 'spices', 'starches', 'other')`
    )
    .addCheckConstraint('ingredients_state_check', sql`state in ('fresh', 'frozen')`)
    .execute()

  await db.schema
    .createIndex('ingredients_user_id_index')
    .on('ingredients')
    .column('user_id')
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('ingredients').execute()
}
