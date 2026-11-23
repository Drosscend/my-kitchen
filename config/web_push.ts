import env from '#start/env'

const publicKey = env.get('VAPID_PUBLIC_KEY')
const privateKey = env.get('VAPID_PRIVATE_KEY')

/**
 * Web push stays off until both VAPID keys are set, so a local setup
 * works without them. Push services may contact the subject about abuse.
 */
export const webPushConfig =
  publicKey && privateKey
    ? {
        publicKey,
        privateKey: privateKey.release(),
        subject: `mailto:${env.get('MAIL_FROM_ADDRESS')}`,
      }
    : null
