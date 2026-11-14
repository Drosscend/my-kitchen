import { sql, type Kysely } from 'kysely'

/**
 * A visitor sharing the cooking demo of the home page has no account: the
 * session it opens belongs to nobody.
 */
export async function up(db: Kysely<unknown>) {
  await db.schema
    .alterTable('cooking_sessions')
    .alterColumn('user_id', (column) => column.dropNotNull())
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await sql`delete from cooking_sessions where user_id is null`.execute(db)
  await db.schema
    .alterTable('cooking_sessions')
    .alterColumn('user_id', (column) => column.setNotNull())
    .execute()
}
