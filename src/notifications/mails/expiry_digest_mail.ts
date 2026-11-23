import { BaseMail } from '@adonisjs/mail'
import { appUrl } from '#config/app'
import { EXPIRY_KINDS, unitLabel } from '#inventory/domain/catalog'
import {
  expiryAlertTitle,
  expiryDigestHeadline,
  expiryDigestSummary,
  groupExpiryAlerts,
  type ExpiryAlert,
  type ExpiryAlertStatus,
} from '#notifications/domain/expiry_alert'

const swatches = {
  expired: { dot: '#e2684a', stampBackground: '#fde6dd', stampColor: '#8a2a15' },
  soon: { dot: '#e9b949', stampBackground: '#fff1c4', stampColor: '#6a4700' },
  check: { dot: '#b08a45', stampBackground: '#f3e7cf', stampColor: '#6e5320' },
} satisfies Record<ExpiryAlertStatus, { dot: string; stampBackground: string; stampColor: string }>

const quantityFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 })
const headingDate = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'Europe/Paris',
})

function relativeDay(daysLeft: number) {
  if (daysLeft < -1) {
    return `depuis ${-daysLeft} jours`
  }

  if (daysLeft === -1) {
    return 'depuis hier'
  }

  if (daysLeft === 0) {
    return "aujourd'hui"
  }

  return daysLeft === 1 ? 'demain' : `dans ${daysLeft} jours`
}

function describe(alert: ExpiryAlert) {
  const [, month, day] = alert.expiresOn.split('-')

  return {
    name: alert.ingredientName,
    detail: `${quantityFormat.format(alert.quantity)} ${unitLabel(alert.unit, alert.quantity)} · ${relativeDay(alert.daysLeft)}`,
    stamp: `${EXPIRY_KINDS[alert.expiryKind].label} ${day}/${month}`,
  }
}

export default class ExpiryDigestMail extends BaseMail {
  constructor(
    private readonly recipient: string,
    private readonly unsubscribeToken: string,
    private readonly alerts: ExpiryAlert[]
  ) {
    super()
  }

  prepare() {
    const sections = groupExpiryAlerts(this.alerts).map((group) => ({
      ...swatches[group.status],
      title: expiryAlertTitle(group.status),
      items: group.alerts.map(describe),
    }))
    const subject = expiryDigestHeadline(this.alerts)
    const preheader = expiryDigestSummary(this.alerts)
    const date = headingDate.format(new Date())
    const inventoryUrl = `${appUrl}/inventory`
    const settingsUrl = `${appUrl}/account#notifications`

    this.message
      .to(this.recipient)
      .subject(subject)
      .listUnsubscribe(`${appUrl}/notifications/unsubscribe/${this.unsubscribeToken}`, {
        oneClick: true,
      })
      .htmlView('emails/expiry_digest', {
        subject,
        preheader,
        logoUrl: `${appUrl}/email-logo.png`,
        date: date.charAt(0).toUpperCase() + date.slice(1),
        sections,
        inventoryUrl,
        settingsUrl,
      })
      .text(
        [
          'Ce matin dans ton garde-manger :',
          ...sections.flatMap((section) => [
            '',
            section.title,
            ...section.items.map((item) => `- ${item.name}, ${item.stamp} (${item.detail})`),
          ]),
          '',
          `Ouvrir mon garde-manger : ${inventoryUrl}`,
          '',
          `Tu reçois ce mail car les alertes de péremption sont activées. Pour te désabonner : ${settingsUrl}`,
        ].join('\n')
      )
  }
}
