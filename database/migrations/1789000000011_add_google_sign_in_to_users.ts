import { sql, type Kysely } from 'kysely'

/**
 * A user may sign in with Google: the account keeps the Google subject,
 * and an account created that way has no password.
 */
export async function up(db: Kysely<unknown>) {
  await db.schema
    .alterTable('users')
    .alterColumn('password', (column) => column.dropNotNull())
    .execute()

  await db.schema.alterTable('users').addColumn('google_id', 'text').execute()

  await db.schema
    .createIndex('users_google_id_unique')
    .on('users')
    .column('google_id')
    .unique()
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropIndex('users_google_id_unique').execute()
  await db.schema.alterTable('users').dropColumn('google_id').execute()
  /**
   * Accounts created through Google cannot satisfy the restored constraint.
   */
  await sql`delete from users where password is null`.execute(db)
  await db.schema
    .alterTable('users')
    .alterColumn('password', (column) => column.setNotNull())
    .execute()
}
