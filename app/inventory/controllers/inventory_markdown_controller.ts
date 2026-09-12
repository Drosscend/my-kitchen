import { inject } from '@adonisjs/core'
import { formatInventoryMarkdown } from '#inventory/queries/inventory_markdown'
import { InventoryQuery } from '#inventory/queries/inventory_query'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * The pantry as pasted into a chat with an assistant.
 */
@inject()
export default class InventoryMarkdownController {
  constructor(private readonly inventory: InventoryQuery) {}

  async execute({ auth, response }: HttpContext) {
    const ingredients = await this.inventory.execute(auth.getUserOrFail().getIdentifier())

    return response.type('text/markdown').send(formatInventoryMarkdown(ingredients))
  }
}
