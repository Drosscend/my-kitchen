import { inject } from '@adonisjs/core'
import { formatInventoryMarkdown } from '#inventory/queries/inventory_markdown'
import { InventoryQuery } from '#inventory/queries/inventory_query'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * JSON is the backup format, the same one the import reads back.
 * Markdown is the pantry as pasted into a chat with an assistant.
 */
@inject()
export default class ExportInventoryController {
  constructor(private readonly inventory: InventoryQuery) {}

  async execute({ auth, params, response }: HttpContext) {
    const ingredients = await this.inventory.execute(auth.getUserOrFail().getIdentifier())

    if (params.format === 'markdown') {
      return response.type('text/markdown').send(formatInventoryMarkdown(ingredients))
    }

    const date = new Date().toISOString().slice(0, 10)
    response.header('Content-Disposition', `attachment; filename="garde-manger-${date}.json"`)
    return response.json(
      ingredients.map(({ name, quantity, unit, category, state }) => ({
        name,
        quantity,
        unit,
        category,
        state,
      }))
    )
  }
}
