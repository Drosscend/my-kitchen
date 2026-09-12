import { BaseMail } from '@adonisjs/mail'

export default class EmailVerificationMail extends BaseMail {
  constructor(
    private readonly recipient: string,
    private readonly name: string | null,
    private readonly url: string
  ) {
    super()
  }

  prepare() {
    this.message
      .to(this.recipient)
      .subject('Confirme ton adresse e-mail')
      .text(
        [
          `Bonjour ${this.name ?? ''}`.trim() + ',',
          '',
          'Pour confirmer ton adresse e-mail sur Mon Garde-Manger, ouvre ce lien :',
          this.url,
          '',
          'Le lien est valable 24 heures.',
          "Si tu n'es pas à l'origine de cette demande, ignore ce message.",
        ].join('\n')
      )
  }
}
