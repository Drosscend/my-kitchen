import { inject } from '@adonisjs/core'
import { notificationErrorMessages } from '#app/notifications/error_messages'
import { SendTestPush } from '#notifications/actions/send_test_push'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class SendTestPushController {
  constructor(private readonly sendTestPush: SendTestPush) {}

  async execute({ response, auth, session, params }: HttpContext) {
    const result = await this.sendTestPush.execute({
      userId: auth.getUserOrFail().getIdentifier(),
      id: params.id,
    })

    if (!result.ok) {
      session.flash('error', notificationErrorMessages[result.error.type])
      return response.redirect().toRoute('account.show')
    }

    session.flash('success', 'Notification de test envoyée')
    return response.redirect().toRoute('account.show')
  }
}
