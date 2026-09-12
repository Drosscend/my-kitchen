import { INGREDIENT_STATE_VALUES, INGREDIENT_STATES } from '#inventory/domain/catalog'
import type { IngredientView } from '#inventory/queries/inventory_query'

function section(items: IngredientView[], title: string) {
  const byCategory = new Map<string, IngredientView[]>()

  for (const item of items) {
    byCategory.set(item.categoryLabel, [...(byCategory.get(item.categoryLabel) ?? []), item])
  }

  const lines = [`## ${title}`]

  for (const [categoryLabel, categoryItems] of byCategory) {
    lines.push('', `### ${categoryLabel}`)

    for (const item of categoryItems) {
      const perishable = item.perishable ? ' (périssable)' : ''
      lines.push(`- ${item.name}: ${item.quantity} ${item.unitLabel}${perishable}`)
    }
  }

  return lines.join('\n')
}

/**
 * The pantry as a Markdown list meant to be pasted into a chat with an
 * assistant: in-stock items only, fresh then frozen, grouped by category.
 */
export function formatInventoryMarkdown(items: IngredientView[]) {
  const inStock = items.filter((item) => item.quantity > 0)
  const sections = INGREDIENT_STATE_VALUES.map((state) => ({
    state,
    items: inStock.filter((item) => item.state === state),
  }))
    .filter(({ items: stateItems }) => stateItems.length > 0)
    .map(({ state, items: stateItems }) => section(stateItems, INGREDIENT_STATES[state].label))

  return `# Mon Garde-Manger\n\n${sections.join('\n\n')}`
}
