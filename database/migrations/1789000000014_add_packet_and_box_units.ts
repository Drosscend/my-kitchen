import { sql, type Kysely } from 'kysely'

/**
 * Packets and boxes join the units of the pantry, counted like pieces.
 */
export async function up(db: Kysely<unknown>) {
  await db.schema.alterTable('ingredients').dropConstraint('ingredients_unit_check').execute()
  await db.schema
    .alterTable('ingredients')
    .addCheckConstraint(
      'ingredients_unit_check',
      sql`unit in ('g', 'kg', 'mL', 'L', 'unit', 'piece', 'packet', 'box')`
    )
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await sql`update ingredients set unit = 'unit' where unit in ('packet', 'box')`.execute(db)
  await db.schema.alterTable('ingredients').dropConstraint('ingredients_unit_check').execute()
  await db.schema
    .alterTable('ingredients')
    .addCheckConstraint(
      'ingredients_unit_check',
      sql`unit in ('g', 'kg', 'mL', 'L', 'unit', 'piece')`
    )
    .execute()
}
