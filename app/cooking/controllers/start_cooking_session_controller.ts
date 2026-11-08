import { inject } from '@adonisjs/core'
import { cookingErrorMessages } from '#app/cooking/error_messages'
import { StartCookingSession } from '#cooking/actions/start_cooking_session'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class StartCookingSessionController {
  constructor(private readonly startCookingSession: StartCookingSession) {}

  async execute({ response, auth, session, params }: HttpContext) {
    const result = await this.startCookingSession.execute({
      userId: auth.getUserOrFail().getIdentifier(),
      recipeId: params.id,
    })

    if (!result.ok) {
      session.flash('error', cookingErrorMessages[result.error.type])
      return response.redirect().toRoute('recipes.index')
    }

    return response.redirect().toRoute('cooking.show', { code: result.value })
  }
}
