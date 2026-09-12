import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { cookingErrorMessages } from '#app/cooking/error_messages'
import { StartCookingSession } from '#cooking/actions/start_cooking_session'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class StartCookingSessionController {
  static readonly validator = vine.create({
    scale: vine.number().positive().max(10),
  })

  constructor(private readonly startCookingSession: StartCookingSession) {}

  async execute({ request, response, auth, session, params }: HttpContext) {
    const { scale } = await request.validateUsing(StartCookingSessionController.validator)
    const result = await this.startCookingSession.execute({
      userId: auth.getUserOrFail().getIdentifier(),
      recipeId: params.id,
      scale,
    })

    if (!result.ok) {
      session.flash('error', cookingErrorMessages[result.error.type])
      return response.redirect().toRoute('recipes.index')
    }

    return response.redirect().toRoute('cooking.show', { code: result.value })
  }
}
