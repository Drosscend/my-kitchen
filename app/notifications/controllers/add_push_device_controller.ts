import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { AddPushDevice } from '#notifications/actions/add_push_device'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Receives the subscription the browser created with the VAPID public key.
 * The server posts to the endpoint later, so it must be a public HTTPS
 * domain, never an IP address or an internal host name.
 */
@inject()
export default class AddPushDeviceController {
  static readonly validator = vine.create({
    endpoint: vine.string().url({
      protocols: ['https'],
      require_protocol: true,
      require_valid_protocol: true,
      host_blacklist: [/^[\d.]+$/, /:/],
    }),
    keys: vine.object({
      p256dh: vine.string(),
      auth: vine.string(),
    }),
  })

  constructor(private readonly addPushDevice: AddPushDevice) {}

  async execute({ request, response, auth, session }: HttpContext) {
    const subscription = await request.validateUsing(AddPushDeviceController.validator)
    await this.addPushDevice.execute({
      userId: auth.getUserOrFail().getIdentifier(),
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent: request.header('user-agent') ?? '',
    })

    session.flash('success', 'Cet appareil recevra les notifications')
    return response.redirect().toRoute('account.show')
  }
}
