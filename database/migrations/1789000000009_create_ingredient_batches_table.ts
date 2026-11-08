import { sql, type Kysely } from 'kysely'

/**
 * The quantity of an ingredient moves into its batches, each with its own
 * expiry date or none. Every stocked ingredient becomes a single undated
 * batch; an empty one keeps no batch.
 */
export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('ingredient_batches')
    .addColumn('id', 'text', (column) => column.primaryKey())
    .addColumn('ingredient_id', 'text', (column) =>
      column.notNull().references('ingredients.id').onDelete('cascade')
    )
    .addColumn('quantity', 'double precision', (column) => column.notNull())
    .addColumn('expires_on', 'date')
    .addColumn('expiry_kind', 'text')
    .addColumn('created_at', 'timestamptz', (column) => column.notNull().defaultTo(sql`now()`))
    .addCheckConstraint('ingredient_batches_quantity_check', sql`quantity > 0`)
    .addCheckConstraint(
      'ingredient_batches_expiry_kind_check',
      sql`expiry_kind in ('use_by', 'best_before')`
    )
    .addCheckConstraint(
      'ingredient_batches_expiry_check',
      sql`(expires_on is null) = (expiry_kind is null)`
    )
    .execute()

  await db.schema
    .createIndex('ingredient_batches_ingredient_id_index')
    .on('ingredient_batches')
    .columns(['ingredient_id', 'expires_on'])
    .execute()

  await sql`
    insert into ingredient_batches (id, ingredient_id, quantity, created_at)
    select 'b' || id, id, quantity, updated_at from ingredients where quantity > 0
  `.execute(db)

  await db.schema.alterTable('ingredients').dropColumn('quantity').execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema
    .alterTable('ingredients')
    .addColumn('quantity', 'double precision', (column) => column.notNull().defaultTo(0))
    .execute()

  await sql`
    update ingredients set quantity = coalesce(
      (select sum(quantity) from ingredient_batches where ingredient_id = ingredients.id), 0
    )
  `.execute(db)

  await db.schema
    .alterTable('ingredients')
    .addCheckConstraint('ingredients_quantity_check', sql`quantity >= 0`)
    .execute()
  await db.schema.dropTable('ingredient_batches').execute()
}
