import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { loginThrottle, mailThrottle, signupThrottle } from '#start/limiter'

const LoginController = () => import('#app/identity/controllers/login_controller')
const RegisterUserController = () => import('#app/identity/controllers/register_user_controller')
const LogoutController = () => import('#app/identity/controllers/logout_controller')
const AccountController = () => import('#app/identity/controllers/account_controller')
const UpdateProfileController = () => import('#app/identity/controllers/update_profile_controller')
const RequestEmailChangeController = () =>
  import('#app/identity/controllers/request_email_change_controller')
const ChangePasswordController = () =>
  import('#app/identity/controllers/change_password_controller')
const DeleteAccountController = () => import('#app/identity/controllers/delete_account_controller')
const RevokeOAuthConnectionController = () =>
  import('#app/identity/controllers/revoke_oauth_connection_controller')
const EmailVerificationController = () =>
  import('#app/identity/controllers/email_verification_controller')
const VerifyEmailController = () => import('#app/identity/controllers/verify_email_controller')
const ForgotPasswordController = () =>
  import('#app/identity/controllers/forgot_password_controller')
const ResetPasswordController = () => import('#app/identity/controllers/reset_password_controller')
const GoogleRedirectController = () =>
  import('#app/identity/controllers/google_redirect_controller')
const GoogleCallbackController = () =>
  import('#app/identity/controllers/google_callback_controller')

router
  .group(() => {
    router.get('signup', [RegisterUserController, 'render']).as('new_account.create')
    router
      .post('signup', [RegisterUserController, 'execute'])
      .as('new_account.store')
      .use(signupThrottle)
    router.get('login', [LoginController, 'render']).as('session.create')
    router.post('login', [LoginController, 'execute']).as('session.store').use(loginThrottle)
    router.get('forgot-password', [ForgotPasswordController, 'render']).as('password.forgot')
    router
      .post('forgot-password', [ForgotPasswordController, 'execute'])
      .as('password.email')
      .use(mailThrottle)
    router.get('reset-password/:token', [ResetPasswordController, 'render']).as('password.reset')
    router.post('reset-password', [ResetPasswordController, 'execute']).as('password.update')
    router.get('auth/google/redirect', [GoogleRedirectController, 'execute']).as('google.redirect')
    router
      .get('auth/google/callback', [GoogleCallbackController, 'execute'])
      .as('google.callback')
      .use(loginThrottle)
  })
  .use(middleware.guest())

/**
 * The confirmation link may be opened from a browser without a session.
 */
router.get('verify-email/:token', [VerifyEmailController, 'execute']).as('verification.verify')

router
  .group(() => {
    router.get('verify-email', [EmailVerificationController, 'render']).as('verification.notice')
    router
      .post('verify-email/resend', [EmailVerificationController, 'execute'])
      .as('verification.resend')
      .use(mailThrottle)
    router.post('logout', [LogoutController, 'execute']).as('session.destroy')
  })
  .use(middleware.auth())

router
  .group(() => {
    router.get('account', [AccountController, 'render']).as('account.show')
    router
      .post('account/profile', [UpdateProfileController, 'execute'])
      .as('account.profile.update')
    router
      .post('account/email', [RequestEmailChangeController, 'execute'])
      .as('account.email.update')
      .use(mailThrottle)
    router
      .post('account/password', [ChangePasswordController, 'execute'])
      .as('account.password.update')
      .use(loginThrottle)
    router
      .delete('account', [DeleteAccountController, 'execute'])
      .as('account.destroy')
      .use(loginThrottle)
    router
      .delete('account/oauth-connections/:id', [RevokeOAuthConnectionController, 'execute'])
      .as('account.oauth_connections.destroy')
  })
  .use([middleware.auth(), middleware.verified()])
