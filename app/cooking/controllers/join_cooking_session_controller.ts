import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { cookingErrorMessages } from '#app/cooking/error_messages'
import { SESSION_CODE_PATTERN } from '#cooking/domain/cooking_session'
import { CookingSessionQuery } from '#cooking/queries/cooking_session_query'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class JoinCookingSessionController {
  static readonly validator = vine.create({
    code: vine.string().trim().regex(SESSION_CODE_PATTERN),
  })

  constructor(private readonly sessions: CookingSessionQuery) {}

  render({ inertia }: HttpContext) {
    return inertia.render('cook/join', {})
  }

  async execute({ request, response, session }: HttpContext) {
    const { code } = await request.validateUsing(JoinCookingSessionController.validator)

    if (!(await this.sessions.execute(code))) {
      session.flash('error', cookingErrorMessages.session_not_found)
      return response.redirect().toRoute('cooking.join')
    }

    return response.redirect().toRoute('cooking.show', { code })
  }
}
