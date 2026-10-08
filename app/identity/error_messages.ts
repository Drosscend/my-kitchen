import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '#identity/domain/password'
import type { RegisterUserError } from '#identity/actions/register_user'
import type { RequestEmailChangeError } from '#identity/actions/request_email_change'
import type { ResetPasswordError } from '#identity/actions/reset_password'
import type { OAuthConnectionNotFoundError } from '#identity/actions/revoke_oauth_connection'
import type { VerifyEmailError } from '#identity/actions/verify_email'

type IdentityError =
  | RegisterUserError
  | RequestEmailChangeError
  | ResetPasswordError
  | VerifyEmailError
  | OAuthConnectionNotFoundError

export const identityErrorMessages = {
  invalid_email_address: "L'adresse e-mail n'est pas valide",
  invalid_password: `Le mot de passe doit contenir entre ${PASSWORD_MIN_LENGTH} et ${PASSWORD_MAX_LENGTH} caractères`,
  email_already_taken: 'Un compte existe déjà pour cette adresse',
  invalid_credentials: 'Mot de passe incorrect',
  same_email: "C'est déjà l'adresse du compte",
  invalid_token: 'Ce lien est invalide ou a expiré',
  oauth_connection_not_found: 'Application introuvable',
} satisfies Record<IdentityError['type'], string>
