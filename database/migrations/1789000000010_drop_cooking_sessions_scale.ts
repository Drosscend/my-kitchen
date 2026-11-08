import type { Kysely } from 'kysely'

/**
 * Recipes are cooked as written, sessions no longer carry a servings factor.
 */
export async function up(db: Kysely<unknown>) {
  await db.schema.alterTable('cooking_sessions').dropColumn('scale').execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema
    .alterTable('cooking_sessions')
    .addColumn('scale', 'double precision', (column) => column.notNull().defaultTo(1))
    .execute()
}
