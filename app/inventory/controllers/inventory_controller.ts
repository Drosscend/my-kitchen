import { inject } from '@adonisjs/core'
import IngredientTransformer from '#app/inventory/transformers/ingredient_transformer'
import { catalogOptions } from '#inventory/domain/catalog'
import { InventoryQuery } from '#inventory/queries/inventory_query'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class InventoryController {
  constructor(private readonly inventory: InventoryQuery) {}

  async render({ auth, inertia }: HttpContext) {
    const ingredients = await this.inventory.execute(auth.getUserOrFail().getIdentifier())

    return inertia.render('inventory/index', {
      ingredients: IngredientTransformer.transform(ingredients),
      catalog: catalogOptions(),
    })
  }
}
