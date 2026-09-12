import vine, { SimpleMessagesProvider, VineDate } from '@vinejs/vine'
import { DateTime } from 'luxon'

declare module '@vinejs/vine/types' {
  interface VineGlobalTransforms {
    date: DateTime
  }
}

VineDate.transform((value) => DateTime.fromJSDate(value))

vine.messagesProvider = new SimpleMessagesProvider({
  'required': 'Ce champ est obligatoire',
  'string': 'Ce champ doit être un texte',
  'number': 'Ce champ doit être un nombre',
  'email': "L'adresse e-mail n'est pas valide",
  'minLength': 'Ce champ doit contenir au moins {{ min }} caractères',
  'maxLength': 'Ce champ doit contenir au plus {{ max }} caractères',
  'confirmed': 'La confirmation ne correspond pas',
  'password.confirmed': 'Les deux mots de passe ne correspondent pas',
})
