import { defineConfig, services } from '@adonisjs/ally'
import env from '#start/env'
import type { InferSocialProviders } from '@adonisjs/ally/types'

const googleClientId = env.get('GOOGLE_CLIENT_ID')
const googleClientSecret = env.get('GOOGLE_CLIENT_SECRET')

/**
 * Google sign-in stays off until both credentials are set, so a local
 * setup without a Google Cloud project keeps working.
 */
export const googleSignInEnabled = Boolean(googleClientId && googleClientSecret)

const allyConfig = defineConfig({
  google: services.google({
    clientId: googleClientId ?? '',
    clientSecret: googleClientSecret?.release() ?? '',
    callbackUrl: `${env.get('APP_URL')}/auth/google/callback`,
    /**
     * Always show the account chooser, so signing out of the app and back
     * in can pick another Google account.
     */
    prompt: 'select_account',
  }),
})

export default allyConfig

declare module '@adonisjs/ally/types' {
  interface SocialProviders extends InferSocialProviders<typeof allyConfig> {}
}
