import { BaseMail } from '@adonisjs/mail'

export default class PasswordResetMail extends BaseMail {
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
      .subject('Réinitialise ton mot de passe')
      .text(
        [
          `Bonjour ${this.name ?? ''}`.trim() + ',',
          '',
          'Pour choisir un nouveau mot de passe sur Mon Garde-Manger, ouvre ce lien :',
          this.url,
          '',
          'Le lien est valable 1 heure et ne sert qu’une fois.',
          "Si tu n'es pas à l'origine de cette demande, ignore ce message.",
        ].join('\n')
      )
  }
}
