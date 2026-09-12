import { test } from '@japa/runner'
import { formatInventoryMarkdown } from '#inventory/queries/inventory_markdown'
import type { IngredientView } from '#inventory/queries/inventory_query'

function view(overrides: Partial<IngredientView>): IngredientView {
  return {
    id: 'x',
    name: 'Tomates',
    quantity: 250,
    unit: 'g',
    unitLabel: 'g',
    category: 'vegetables',
    categoryLabel: 'Légumes',
    state: 'fresh',
    stateLabel: 'Frais',
    lowStock: false,
    perishable: true,
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  }
}

test.group('Inventory markdown', () => {
  test('lists in-stock items by state then category with the perishable tag', ({ assert }) => {
    const markdown = formatInventoryMarkdown([
      view({ name: 'Tomates cerises' }),
      view({ name: 'Farine', quantity: 0, category: 'starches', categoryLabel: 'Féculents' }),
      view({
        name: 'Boulettes',
        quantity: 4,
        unit: 'piece',
        unitLabel: 'pièces',
        category: 'meat',
        categoryLabel: 'Viandes',
        state: 'frozen',
        stateLabel: 'Congelé',
        perishable: false,
      }),
    ])

    assert.equal(
      markdown,
      [
        '# Mon Garde-Manger',
        '',
        '## Frais',
        '',
        '### Légumes',
        '- Tomates cerises: 250 g (périssable)',
        '',
        '## Congelé',
        '',
        '### Viandes',
        '- Boulettes: 4 pièces',
      ].join('\n')
    )
  })
})
