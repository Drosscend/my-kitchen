import { sql, type Kysely } from 'kysely'

/**
 * Assistants now connect through OAuth: the personal tokens go, and the
 * authorization server keeps its artifacts (clients, grants, codes,
 * tokens, sessions) in one table, as oidc-provider adapters expect.
 * Credential identifiers are stored hashed; `account_id` ties every
 * artifact of a user to the account, so deleting it revokes them.
 */
export async function up(db: Kysely<unknown>) {
  await db.schema.dropTable('mcp_tokens').execute()

  await db.schema
    .createTable('oauth_models')
    .addColumn('kind', 'text', (column) => column.notNull())
    .addColumn('id', 'text', (column) => column.notNull())
    .addColumn('payload', 'jsonb', (column) => column.notNull())
    .addColumn('grant_id', 'text')
    .addColumn('uid', 'text')
    .addColumn('account_id', 'text', (column) => column.references('users.id').onDelete('cascade'))
    .addColumn('client_name', 'text')
    .addColumn('expires_at', 'timestamptz')
    .addColumn('consumed_at', 'timestamptz')
    .addColumn('last_used_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (column) => column.notNull().defaultTo(sql`now()`))
    .addPrimaryKeyConstraint('oauth_models_pkey', ['kind', 'id'])
    .execute()

  await db.schema
    .createIndex('oauth_models_grant_id_index')
    .on('oauth_models')
    .column('grant_id')
    .execute()
  await db.schema
    .createIndex('oauth_models_uid_index')
    .on('oauth_models')
    .columns(['kind', 'uid'])
    .execute()
  await db.schema
    .createIndex('oauth_models_account_id_index')
    .on('oauth_models')
    .column('account_id')
    .execute()
  await db.schema
    .createIndex('oauth_models_expires_at_index')
    .on('oauth_models')
    .column('expires_at')
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('oauth_models').execute()

  await db.schema
    .createTable('mcp_tokens')
    .addColumn('id', 'text', (column) => column.primaryKey())
    .addColumn('user_id', 'text', (column) =>
      column.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('name', 'text', (column) => column.notNull())
    .addColumn('prefix', 'text', (column) => column.notNull())
    .addColumn('token_hash', 'text', (column) => column.notNull().unique())
    .addColumn('created_at', 'timestamptz', (column) => column.notNull().defaultTo(sql`now()`))
    .addColumn('last_used_at', 'timestamptz')
    .execute()

  await db.schema
    .createIndex('mcp_tokens_user_id_index')
    .on('mcp_tokens')
    .column('user_id')
    .execute()
}
