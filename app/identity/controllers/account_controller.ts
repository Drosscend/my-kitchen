import { inject } from '@adonisjs/core'
import AccountDetailsTransformer from '#app/identity/transformers/account_details_transformer'
import OAuthConnectionTransformer from '#app/identity/transformers/oauth_connection_transformer'
import ExpiryWarningTransformer from '#app/inventory/transformers/expiry_warning_transformer'
import NotificationSettingsTransformer from '#app/notifications/transformers/notification_settings_transformer'
import PushDeviceTransformer from '#app/notifications/transformers/push_device_transformer'
import { mcpResourceUrl } from '#app/oauth/provider'
import { googleSignInEnabled } from '#config/ally'
import { webPushConfig } from '#config/web_push'
import { AccountDetailsQuery } from '#identity/queries/account_details_query'
import { OAuthConnectionsQuery } from '#identity/queries/oauth_connections_query'
import { ExpiryWarningsQuery } from '#inventory/queries/expiry_warnings_query'
import { NotificationSettingsQuery } from '#notifications/queries/notification_settings_query'
import { PushDevicesQuery } from '#notifications/queries/push_devices_query'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class AccountController {
  constructor(
    private readonly accountDetails: AccountDetailsQuery,
    private readonly oauthConnections: OAuthConnectionsQuery,
    private readonly notificationSettings: NotificationSettingsQuery,
    private readonly pushDevices: PushDevicesQuery,
    private readonly expiryWarnings: ExpiryWarningsQuery
  ) {}

  async render({ auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()
    const [account, connections, notifications, devices, warnings] = await Promise.all([
      this.accountDetails.execute(user.getIdentifier()),
      this.oauthConnections.execute(user.getIdentifier()),
      this.notificationSettings.execute(user.getIdentifier()),
      this.pushDevices.execute(user.getIdentifier()),
      this.expiryWarnings.execute(user.getIdentifier()),
    ])

    return inertia.render('account/show', {
      account: AccountDetailsTransformer.transform(account),
      oauthConnections: OAuthConnectionTransformer.transform(connections),
      notifications: NotificationSettingsTransformer.transform(notifications),
      pushDevices: PushDeviceTransformer.transform(devices),
      vapidPublicKey: webPushConfig?.publicKey ?? null,
      expiryWarnings: ExpiryWarningTransformer.transform(warnings),
      mcpUrl: mcpResourceUrl,
      googleSignIn: googleSignInEnabled,
    })
  }
}
