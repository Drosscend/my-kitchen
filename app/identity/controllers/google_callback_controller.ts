import { inject } from '@adonisjs/core'
import { identityErrorMessages } from '#app/identity/error_messages'
import { redirectAfterLogin } from '#app/identity/redirect_after_login'
import { googleSignInEnabled } from '#config/ally'
import { SignInWithGoogle, type SignInWithGoogleError } from '#identity/actions/sign_in_with_google'
import type { HttpContext } from '@adonisjs/core/http'

const errorMessages = {
  google_email_unverified: "Ton adresse Google n'est pas confirmée",
  account_email_unverified:
    "Un compte existe déjà pour cette adresse sans être confirmé : connecte-toi avec ton mot de passe pour la confirmer d'abord",
  invalid_email_address: identityErrorMessages.invalid_email_address,
  email_already_taken: 'Cette adresse est déjà liée à un autre compte Google',
} satisfies Record<SignInWithGoogleError['type'], string>

@inject()
export default class GoogleCallbackController {
  constructor(private readonly signInWithGoogle: SignInWithGoogle) {}

  /**
   * Redirects drop the query string: it carries the authorization code.
   */
  async execute(ctx: HttpContext) {
    const { ally, auth, response, session } = ctx

    if (!googleSignInEnabled) {
      session.flash('error', "La connexion avec Google n'est pas disponible")
      return response.redirect().withQs(false).toRoute('session.create')
    }

    const google = ally.use('google')

    if (google.accessDenied()) {
      session.flash('error', 'Connexion avec Google annulée')
      return response.redirect().withQs(false).toRoute('session.create')
    }

    if (google.stateMisMatch() || google.hasError()) {
      session.flash('error', 'La connexion avec Google a échoué, réessaie')
      return response.redirect().withQs(false).toRoute('session.create')
    }

    const profile = await google.user()
    const result = await this.signInWithGoogle.execute({
      googleId: String(profile.id),
      email: String(profile.email ?? ''),
      emailVerified: profile.emailVerificationState === 'verified',
      name: profile.original?.given_name ?? profile.name ?? null,
    })

    if (!result.ok) {
      session.flash('error', errorMessages[result.error.type])
      return response.redirect().withQs(false).toRoute('session.create')
    }

    await auth.use('web').login(result.value)
    return redirectAfterLogin(ctx)
  }
}
