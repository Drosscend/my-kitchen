import { BaseMail } from '@adonisjs/mail'
import { appUrl } from '#config/app'

export default class EmailChangeMail extends BaseMail {
  constructor(
    private readonly recipient: string,
    private readonly name: string | null,
    private readonly url: string,
    private readonly currentEmail: string
  ) {
    super()
  }

  prepare() {
    const subject = 'Confirme ta nouvelle adresse e-mail'

    this.message
      .to(this.recipient)
      .subject(subject)
      .htmlView('emails/email_change', {
        subject,
        preheader: "Elle remplacera l'actuelle après confirmation.",
        logoUrl: `${appUrl}/email-logo.png`,
        email: this.recipient,
        currentEmail: this.currentEmail,
        url: this.url,
      })
      .text(
        [
          `Bonjour ${this.name ?? ''}`.trim() + ',',
          '',
          `Tu as demandé à utiliser ${this.recipient} pour ton compte Mon Garde-Manger. Elle remplacera ${this.currentEmail} dès que tu l'auras confirmée :`,
          this.url,
          '',
          'Le lien est valable 24 heures.',
          "Si tu n'es pas à l'origine de cette demande, ignore ce message : ton adresse actuelle ne change pas.",
        ].join('\n')
      )
  }
}
