import { sql, type Kysely } from 'kysely'

/**
 * Each ingredient carries its own low stock threshold, in its unit; zero
 * never alerts. Existing ingredients keep the alert they had: the
 * threshold of their category converted to their unit, three for the
 * ones counted in units or pieces.
 */
export async function up(db: Kysely<unknown>) {
  await db.schema
    .alterTable('ingredients')
    .addColumn('low_stock_threshold', 'double precision', (column) => column.notNull().defaultTo(0))
    .execute()

  await db.schema
    .alterTable('ingredients')
    .addCheckConstraint('ingredients_low_stock_threshold_check', sql`low_stock_threshold >= 0`)
    .execute()

  await sql`
    update ingredients
    set low_stock_threshold = case
      when unit in ('unit', 'piece') then 3
      else
        case category
          when 'meat' then 300
          when 'dairy' then 500
          when 'starches' then 500
          when 'spices' then 50
          when 'other' then 100
          else 200
        end / case when unit in ('kg', 'L') then 1000.0 else 1 end
    end
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema.alterTable('ingredients').dropColumn('low_stock_threshold').execute()
}
