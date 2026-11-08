import { inject } from '@adonisjs/core'
import { ingredientErrorMessages } from '#app/inventory/error_messages'
import { RemoveIngredientBatch } from '#inventory/actions/remove_ingredient_batch'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class RemoveIngredientBatchController {
  constructor(private readonly removeIngredientBatch: RemoveIngredientBatch) {}

  async execute({ response, auth, session, params }: HttpContext) {
    const result = await this.removeIngredientBatch.execute({
      userId: auth.getUserOrFail().getIdentifier(),
      id: params.id,
      batchId: params.batchId,
    })

    if (!result.ok) {
      session.flash('error', ingredientErrorMessages[result.error.type])
    }

    return response.redirect().toRoute('inventory.index')
  }
}
