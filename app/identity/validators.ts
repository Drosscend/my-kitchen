import vine from '@vinejs/vine'
import { MAX_EMAIL_LENGTH } from '#identity/domain/email_address'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '#identity/domain/password'
import { MAX_NAME_LENGTH } from '#identity/domain/user'

export const emailField = vine.string().trim().email().maxLength(MAX_EMAIL_LENGTH)
export const passwordField = vine
  .string()
  .minLength(PASSWORD_MIN_LENGTH)
  .maxLength(PASSWORD_MAX_LENGTH)
/**
 * Vine rules are pushed onto the schema instance, so the confirmed
 * variant is a copy rather than a chain on the shared field.
 */
export const confirmedPasswordField = passwordField
  .clone()
  .confirmed({ confirmationField: 'passwordConfirmation' })
export const nameField = vine.string().trim().maxLength(MAX_NAME_LENGTH)
