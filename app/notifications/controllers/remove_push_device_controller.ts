import { inject } from '@adonisjs/core'
import { notificationErrorMessages } from '#app/notifications/error_messages'
import { RemovePushDevice } from '#notifications/actions/remove_push_device'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class RemovePushDeviceController {
  constructor(private readonly removePushDevice: RemovePushDevice) {}

  async execute({ response, auth, session, params }: HttpContext) {
    const result = await this.removePushDevice.execute({
      userId: auth.getUserOrFail().getIdentifier(),
      id: params.id,
    })

    if (!result.ok) {
      session.flash('error', notificationErrorMessages[result.error.type])
      return response.redirect().toRoute('account.show')
    }

    session.flash('success', 'Appareil retiré')
    return response.redirect().toRoute('account.show')
  }
}
