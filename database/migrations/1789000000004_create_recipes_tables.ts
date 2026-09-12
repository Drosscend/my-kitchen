import { sql, type Kysely } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('recipes')
    .addColumn('id', 'text', (column) => column.primaryKey())
    .addColumn('user_id', 'text', (column) =>
      column.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('title', 'text', (column) => column.notNull())
    .addColumn('description', 'text')
    .addColumn('base_servings', 'integer', (column) => column.notNull())
    .addColumn('notes', 'text')
    .addColumn('created_at', 'timestamptz', (column) => column.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (column) => column.notNull().defaultTo(sql`now()`))
    .addCheckConstraint('recipes_base_servings_check', sql`base_servings > 0`)
    .execute()

  await db.schema.createIndex('recipes_user_id_index').on('recipes').column('user_id').execute()

  /**
   * `ref` is the key a step uses to mention the ingredient in its text,
   * chosen by whoever wrote the recipe.
   */
  await db.schema
    .createTable('recipe_ingredients')
    .addColumn('id', 'text', (column) => column.primaryKey())
    .addColumn('recipe_id', 'text', (column) =>
      column.notNull().references('recipes.id').onDelete('cascade')
    )
    .addColumn('position', 'integer', (column) => column.notNull())
    .addColumn('ref', 'text', (column) => column.notNull())
    .addColumn('name', 'text', (column) => column.notNull())
    .addColumn('amount', 'double precision')
    .addColumn('unit', 'text')
    .addUniqueConstraint('recipe_ingredients_recipe_id_ref_unique', ['recipe_id', 'ref'])
    .execute()

  await db.schema
    .createTable('recipe_steps')
    .addColumn('id', 'text', (column) => column.primaryKey())
    .addColumn('recipe_id', 'text', (column) =>
      column.notNull().references('recipes.id').onDelete('cascade')
    )
    .addColumn('position', 'integer', (column) => column.notNull())
    .addColumn('ref', 'text', (column) => column.notNull())
    .addColumn('title', 'text')
    .addColumn('content', 'text', (column) => column.notNull())
    .addColumn('timer_seconds', 'integer')
    .addUniqueConstraint('recipe_steps_recipe_id_ref_unique', ['recipe_id', 'ref'])
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('recipe_steps').execute()
  await db.schema.dropTable('recipe_ingredients').execute()
  await db.schema.dropTable('recipes').execute()
}
