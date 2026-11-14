import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { cookingErrorMessages } from '#app/cooking/error_messages'
import { StartDemoCookingSession } from '#cooking/actions/start_demo_cooking_session'
import { DEMO_RECIPE } from '#cooking/domain/demo_recipe'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * The cooking mode on a sample recipe, kept in the browser: the home page
 * frames it on a laptop and two phones. Sharing it opens a real session,
 * one per visitor, that a phone joins by its code.
 */
@inject()
export default class CookingDemoController {
  static readonly validator = vine.create({
    currentStepIndex: vine.number().withoutDecimals(),
    activeTimers: vine.record(
      vine.object({
        total: vine.number().min(0),
        startedAt: vine.number(),
        pausedRemaining: vine.number().min(0).optional(),
      })
    ),
  })

  constructor(private readonly startDemoCookingSession: StartDemoCookingSession) {}

  render({ inertia }: HttpContext) {
    return inertia.render('cook/demo', { recipe: DEMO_RECIPE })
  }

  async execute({ request, response }: HttpContext) {
    const state = await request.validateUsing(CookingDemoController.validator)
    const result = await this.startDemoCookingSession.execute({ state })

    if (!result.ok) {
      return response.serviceUnavailable({ error: cookingErrorMessages.code_exhausted })
    }

    return response.created({ code: result.value })
  }
}
