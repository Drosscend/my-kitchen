import type { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createIndex('cooking_sessions_user_id_index')
    .on('cooking_sessions')
    .column('user_id')
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropIndex('cooking_sessions_user_id_index').execute()
}
