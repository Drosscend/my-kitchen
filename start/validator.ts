import vine, { SimpleMessagesProvider } from '@vinejs/vine'

vine.messagesProvider = new SimpleMessagesProvider({
  'required': 'Ce champ est obligatoire',
  'string': 'Ce champ doit être un texte',
  'number': 'Ce champ doit être un nombre',
  'email': "L'adresse e-mail n'est pas valide",
  'minLength': 'Ce champ doit contenir au moins {{ min }} caractères',
  'maxLength': 'Ce champ doit contenir au plus {{ max }} caractères',
  'min': 'Ce champ doit valoir au moins {{ min }}',
  'max': 'Ce champ doit valoir au plus {{ max }}',
  'positive': 'Ce champ doit être un nombre positif',
  'withoutDecimals': 'Ce champ doit être un nombre entier',
  'passwordConfirmation.confirmed': 'Les deux mots de passe ne correspondent pas',
})
