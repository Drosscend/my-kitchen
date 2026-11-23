import { BaseMail } from '@adonisjs/mail'
import { appUrl } from '#config/app'
import { formatSecurityMailDate } from '#identity/mails/security_mail_date'

export default class PasswordChangedMail extends BaseMail {
  constructor(
    private readonly recipient: string,
    private readonly changedAt: Date
  ) {
    super()
  }

  prepare() {
    const subject = 'Ton mot de passe a été modifié'
    const date = formatSecurityMailDate(this.changedAt)
    const resetUrl = `${appUrl}/forgot-password`

    this.message
      .to(this.recipient)
      .subject(subject)
      .htmlView('emails/password_changed', {
        subject,
        preheader: "Si ce n'est pas toi, réinitialise-le tout de suite.",
        logoUrl: `${appUrl}/email-logo.png`,
        date,
        email: this.recipient,
        resetUrl,
      })
      .text(
        [
          `Le mot de passe de ton compte Mon Garde-Manger (${this.recipient}) a été modifié le ${date}.`,
          '',
          "Si ce n'est pas toi, réinitialise-le tout de suite, le lien arrivera sur cette adresse :",
          resetUrl,
        ].join('\n')
      )
  }
}
