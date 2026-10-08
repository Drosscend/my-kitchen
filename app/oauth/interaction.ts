import { errors } from 'oidc-provider'
import { LOOPBACK_HOSTS, oauthProvider } from '#app/oauth/provider'
import type { HttpContext } from '@adonisjs/core/http'

export interface PendingAuthorization {
  uid: string
  clientId: string
  clientName: string
  redirectHost: string
  /**
   * A loopback redirect means a program on the user's machine: any
   * local process could claim that name, the page warns about it.
   */
  local: boolean
}

/**
 * Loads the authorization request the provider parked behind its
 * interaction cookie. Null when the cookie is missing, expired, or
 * belongs to another request.
 */
export async function findPendingAuthorization({
  request,
  response,
  params,
}: HttpContext): Promise<PendingAuthorization | null> {
  let interaction
  try {
    interaction = await oauthProvider.interactionDetails(request.request, response.response)
  } catch (error) {
    if (error instanceof errors.SessionNotFound) {
      return null
    }
    throw error
  }

  if (interaction.uid !== params.uid) {
    return null
  }

  const clientId = String(interaction.params.client_id)
  const client = await oauthProvider.Client.find(clientId)
  const redirectUri = new URL(String(interaction.params.redirect_uri))

  return {
    uid: interaction.uid,
    clientId,
    clientName: client?.clientName ?? URL.parse(clientId)?.hostname ?? clientId,
    redirectHost: redirectUri.host,
    local: LOOPBACK_HOSTS.has(redirectUri.hostname),
  }
}
