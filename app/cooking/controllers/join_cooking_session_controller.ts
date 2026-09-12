import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { recipeErrorMessages } from '#app/recipes/error_messages'
import { CookingSessionQuery } from '#cooking/queries/cooking_session_query'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class JoinCookingSessionController {
  static readonly validator = vine.create({
    code: vine
      .string()
      .trim()
      .regex(/^\d{6}$/),
  })

  constructor(private readonly sessions: CookingSessionQuery) {}

  render({ inertia }: HttpContext) {
    return inertia.render('cook/join', {})
  }

  async execute({ request, response, session }: HttpContext) {
    const { code } = await request.validateUsing(JoinCookingSessionController.validator)

    if (!(await this.sessions.execute(code))) {
      session.flash('error', recipeErrorMessages.session_not_found)
      return response.redirect().toRoute('cooking.join')
    }

    return response.redirect().toRoute('cooking.show', { code })
  }
}
