const formatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'full',
  timeStyle: 'short',
  timeZone: 'Europe/Paris',
})

export function formatSecurityMailDate(date: Date) {
  return formatter.format(date)
}
