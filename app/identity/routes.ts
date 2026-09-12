import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const LoginController = () => import('#app/identity/controllers/login_controller')
const RegisterUserController = () => import('#app/identity/controllers/register_user_controller')
const LogoutController = () => import('#app/identity/controllers/logout_controller')
const AccountController = () => import('#app/identity/controllers/account_controller')
const EmailVerificationController = () =>
  import('#app/identity/controllers/email_verification_controller')
const VerifyEmailController = () => import('#app/identity/controllers/verify_email_controller')
const ForgotPasswordController = () =>
  import('#app/identity/controllers/forgot_password_controller')
const ResetPasswordController = () => import('#app/identity/controllers/reset_password_controller')

router
  .group(() => {
    router.get('signup', [RegisterUserController, 'render']).as('new_account.create')
    router.post('signup', [RegisterUserController, 'execute']).as('new_account.store')
    router.get('login', [LoginController, 'render']).as('session.create')
    router.post('login', [LoginController, 'execute']).as('session.store')
    router.get('forgot-password', [ForgotPasswordController, 'render']).as('password.forgot')
    router.post('forgot-password', [ForgotPasswordController, 'execute']).as('password.email')
    router.get('reset-password/:token', [ResetPasswordController, 'render']).as('password.reset')
    router.post('reset-password', [ResetPasswordController, 'execute']).as('password.update')
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
    router.post('logout', [LogoutController, 'execute']).as('session.destroy')
  })
  .use(middleware.auth())

router
  .group(() => {
    router.get('account', [AccountController, 'render']).as('account.show')
  })
  .use([middleware.auth(), middleware.verified()])
