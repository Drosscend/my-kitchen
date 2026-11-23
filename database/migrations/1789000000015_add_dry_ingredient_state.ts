import { sql, type Kysely } from 'kysely'

/**
 * Dry products, cans and packets kept at room temperature, join fresh and
 * frozen ones.
 */
export async function up(db: Kysely<unknown>) {
  await db.schema.alterTable('ingredients').dropConstraint('ingredients_state_check').execute()
  await db.schema
    .alterTable('ingredients')
    .addCheckConstraint('ingredients_state_check', sql`state in ('fresh', 'frozen', 'dry')`)
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await sql`update ingredients set state = 'fresh' where state = 'dry'`.execute(db)
  await db.schema.alterTable('ingredients').dropConstraint('ingredients_state_check').execute()
  await db.schema
    .alterTable('ingredients')
    .addCheckConstraint('ingredients_state_check', sql`state in ('fresh', 'frozen')`)
    .execute()
}
