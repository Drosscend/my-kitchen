import app from '@adonisjs/core/services/app'
import { OAuthError, OAuthErrorCode, type OAuthTokenVerifier } from '@modelcontextprotocol/server'
import { mcpResourceUrl, oauthProvider } from '#app/oauth/provider'
import { RecordOAuthConnectionUse } from '#identity/actions/record_oauth_connection_use'

/**
 * Checks an access token against the authorization server storage: it
 * must exist, be unexpired and have been issued for the MCP endpoint.
 */
export const mcpTokenVerifier: OAuthTokenVerifier = {
  async verifyAccessToken(token) {
    const accessToken = await oauthProvider.AccessToken.find(token)

    if (!accessToken?.accountId || !accessToken.clientId || accessToken.aud !== mcpResourceUrl) {
      throw new OAuthError(OAuthErrorCode.InvalidToken, 'Invalid access token')
    }

    if (accessToken.grantId) {
      const recordUse = await app.container.make(RecordOAuthConnectionUse)
      await recordUse.execute({ grantId: accessToken.grantId })
    }

    return {
      token,
      clientId: accessToken.clientId,
      scopes: accessToken.scope?.split(' ') ?? [],
      expiresAt: accessToken.exp,
      resource: new URL(mcpResourceUrl),
      extra: { userId: accessToken.accountId },
    }
  },
}
