import { sql, type Kysely } from 'kysely'

/**
 * Personal access tokens for the MCP endpoint. Only a hash is stored;
 * the prefix lets the owner recognize a token in the list.
 */
export async function up(db: Kysely<unknown>) {
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

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('mcp_tokens').execute()
}
