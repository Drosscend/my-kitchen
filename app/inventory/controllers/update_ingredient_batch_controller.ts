import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { ingredientErrorMessages } from '#app/inventory/error_messages'
import { expiryFields } from '#app/inventory/validators'
import { UpdateIngredientBatch } from '#inventory/actions/update_ingredient_batch'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class UpdateIngredientBatchController {
  static readonly validator = vine.create({
    quantity: vine.number().positive().optional(),
    ...expiryFields,
  })

  constructor(private readonly updateIngredientBatch: UpdateIngredientBatch) {}

  async execute({ request, response, auth, session, params }: HttpContext) {
    const changes = await request.validateUsing(UpdateIngredientBatchController.validator)
    const result = await this.updateIngredientBatch.execute({
      userId: auth.getUserOrFail().getIdentifier(),
      id: params.id,
      batchId: params.batchId,
      changes,
    })

    if (!result.ok) {
      session.flash('error', ingredientErrorMessages[result.error.type])
    }

    return response.redirect().toRoute('inventory.index')
  }
}
