import { BaseMail } from '@adonisjs/mail'
import { appUrl } from '#config/app'
import { formatSecurityMailDate } from '#identity/mails/security_mail_date'

export default class ConnectedApplicationMail extends BaseMail {
  constructor(
    private readonly recipient: string,
    private readonly clientName: string,
    private readonly authorizedAt: Date
  ) {
    super()
  }

  prepare() {
    const subject = `Nouvelle application connectée : ${this.clientName}`
    const date = formatSecurityMailDate(this.authorizedAt)
    const accountUrl = `${appUrl}/account`

    this.message
      .to(this.recipient)
      .subject(subject)
      .htmlView('emails/connected_application', {
        subject,
        preheader: 'Elle peut lire et modifier ton garde-manger.',
        logoUrl: `${appUrl}/email-logo.png`,
        clientName: this.clientName,
        date,
        accountUrl,
      })
      .text(
        [
          `Tu as autorisé ${this.clientName} à utiliser ton compte Mon Garde-Manger le ${date}.`,
          'Elle peut lire et modifier ton inventaire et tes recettes.',
          '',
          "Si ce n'est pas toi, retire l'accès depuis ta page compte, puis change ton mot de passe :",
          accountUrl,
        ].join('\n')
      )
  }
}
