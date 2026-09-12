import { inject } from '@adonisjs/core'
import CookingSessionTransformer from '#app/cooking/transformers/cooking_session_transformer'
import { CookingSessionQuery } from '#cooking/queries/cooking_session_query'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class CookingSessionController {
  constructor(private readonly sessions: CookingSessionQuery) {}

  async render({ inertia, params, response }: HttpContext) {
    const session = await this.sessions.execute(params.code)

    if (!session) {
      return response.notFound()
    }

    return inertia.render('cook/show', {
      session: CookingSessionTransformer.transform(session),
    })
  }
}
