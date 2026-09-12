import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { cookingErrorMessages } from '#app/cooking/error_messages'
import CookingSessionTransformer from '#app/cooking/transformers/cooking_session_transformer'
import { UpdateCookingSession } from '#cooking/actions/update_cooking_session'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * The six digit code is the only credential: whoever holds it drives
 * the steps and the timers, which is the point of sharing it.
 */
@inject()
export default class UpdateCookingSessionStateController {
  static readonly validator = vine.create({
    currentStepIndex: vine.number().optional(),
    completedSteps: vine.array(vine.string()).optional(),
    activeTimers: vine
      .record(
        vine.object({
          total: vine.number().min(0),
          startedAt: vine.number(),
          pausedRemaining: vine.number().min(0).optional(),
        })
      )
      .optional(),
    closed: vine.boolean().optional(),
  })

  constructor(private readonly updateCookingSession: UpdateCookingSession) {}

  async execute({ request, params, response }: HttpContext) {
    const update = await request.validateUsing(UpdateCookingSessionStateController.validator)
    const result = await this.updateCookingSession.execute({ code: params.code, update })

    if (!result.ok) {
      return response.notFound({ error: cookingErrorMessages.session_not_found })
    }

    return response.json(new CookingSessionTransformer(result.value).toObject())
  }
}
