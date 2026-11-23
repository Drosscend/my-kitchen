import { BaseMail } from '@adonisjs/mail'
import { appUrl } from '#config/app'
import { formatSecurityMailDate } from '#identity/mails/security_mail_date'

export default class EmailChangedMail extends BaseMail {
  constructor(
    private readonly recipient: string,
    private readonly newEmail: string,
    private readonly changedAt: Date
  ) {
    super()
  }

  prepare() {
    const subject = "L'adresse de ton compte a changé"
    const date = formatSecurityMailDate(this.changedAt)

    this.message
      .to(this.recipient)
      .subject(subject)
      .htmlView('emails/email_changed', {
        subject,
        preheader: `Elle est désormais ${this.newEmail}.`,
        logoUrl: `${appUrl}/email-logo.png`,
        previousEmail: this.recipient,
        newEmail: this.newEmail,
        date,
      })
      .text(
        [
          `L'adresse de ton compte Mon Garde-Manger est passée de ${this.recipient} à ${this.newEmail} le ${date}.`,
          '',
          "Ce mail part à ton ancienne adresse, au cas où ce changement ne viendrait pas de toi. Si ce n'est pas toi, réponds à ce mail pour qu'on bloque le compte.",
        ].join('\n')
      )
  }
}
