import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '#identity/domain/password'
import type { InvalidTokenNameError } from '#identity/actions/create_mcp_token'
import type { RegisterUserError } from '#identity/actions/register_user'
import type { RequestEmailChangeError } from '#identity/actions/request_email_change'
import type { ResetPasswordError } from '#identity/actions/reset_password'
import type { McpTokenNotFoundError } from '#identity/actions/revoke_mcp_token'
import type { VerifyEmailError } from '#identity/actions/verify_email'

type IdentityError =
  | RegisterUserError
  | RequestEmailChangeError
  | ResetPasswordError
  | VerifyEmailError
  | InvalidTokenNameError
  | McpTokenNotFoundError

export const identityErrorMessages = {
  invalid_email_address: "L'adresse e-mail n'est pas valide",
  invalid_password: `Le mot de passe doit contenir entre ${PASSWORD_MIN_LENGTH} et ${PASSWORD_MAX_LENGTH} caractères`,
  email_already_taken: 'Un compte existe déjà pour cette adresse',
  invalid_credentials: 'Mot de passe incorrect',
  same_email: "C'est déjà l'adresse du compte",
  invalid_token: 'Ce lien est invalide ou a expiré',
  invalid_token_name: 'Le nom du token est obligatoire',
  mcp_token_not_found: 'Token introuvable',
} satisfies Record<IdentityError['type'], string>
