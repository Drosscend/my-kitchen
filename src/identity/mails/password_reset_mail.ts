import { BaseMail } from '@adonisjs/mail'
import { appUrl } from '#config/app'

export default class PasswordResetMail extends BaseMail {
  constructor(
    private readonly recipient: string,
    private readonly name: string | null,
    private readonly url: string
  ) {
    super()
  }

  prepare() {
    const subject = 'Réinitialise ton mot de passe'

    this.message
      .to(this.recipient)
      .subject(subject)
      .htmlView('emails/password_reset', {
        subject,
        preheader: 'Le lien est valable 1 heure.',
        logoUrl: `${appUrl}/email-logo.png`,
        url: this.url,
      })
      .text(
        [
          `Bonjour ${this.name ?? ''}`.trim() + ',',
          '',
          'Pour choisir un nouveau mot de passe sur Mon Garde-Manger, ouvre ce lien :',
          this.url,
          '',
          'Le lien est valable 1 heure et ne sert qu’une fois.',
          "Si tu n'es pas à l'origine de cette demande, ignore ce message : ton mot de passe actuel reste valable.",
        ].join('\n')
      )
  }
}
