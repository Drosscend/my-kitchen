import { BaseMail } from '@adonisjs/mail'
import { appUrl } from '#config/app'

export default class EmailVerificationMail extends BaseMail {
  constructor(
    private readonly recipient: string,
    private readonly name: string | null,
    private readonly url: string
  ) {
    super()
  }

  prepare() {
    const subject = 'Confirme ton adresse e-mail'

    this.message
      .to(this.recipient)
      .subject(subject)
      .htmlView('emails/email_verification', {
        subject,
        preheader: 'Un clic et ton garde-manger est prêt.',
        logoUrl: `${appUrl}/email-logo.png`,
        name: this.name,
        url: this.url,
      })
      .text(
        [
          `Bonjour ${this.name ?? ''}`.trim() + ',',
          '',
          'Pour confirmer ton adresse e-mail sur Mon Garde-Manger, ouvre ce lien :',
          this.url,
          '',
          'Le lien est valable 24 heures.',
          "Si tu n'as pas créé de compte, ignore ce message.",
        ].join('\n')
      )
  }
}
