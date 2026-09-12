import { inject } from '@adonisjs/core'
import { sessionPayload } from '#app/cooking/session_payload'
import { CookingSessionQuery } from '#cooking/queries/cooking_session_query'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Polled every half second by every device on the session.
 */
@inject()
export default class CookingSessionStateController {
  constructor(private readonly sessions: CookingSessionQuery) {}

  async execute({ params, response }: HttpContext) {
    const session = await this.sessions.execute(params.code)

    if (!session) {
      return response.notFound({ error: 'Session introuvable' })
    }

    return response.json(sessionPayload(session))
  }
}
