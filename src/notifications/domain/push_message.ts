/**
 * What the service worker shows: the notification text and the page a
 * tap opens.
 */
export interface PushMessage {
  title: string
  body: string
  url: string
}
