import {
  buildOAuthProtectedResourceMetadata,
  getOAuthProtectedResourceMetadataUrl,
} from '@modelcontextprotocol/server'
import { MCP_SCOPE, mcpResourceUrl, OAUTH_PREFIX, oauthProvider } from '#app/oauth/provider'

/**
 * RFC 9728 document of the MCP endpoint: where assistants find the
 * authorization server that issues its tokens.
 */
export const protectedResourceMetadata = buildOAuthProtectedResourceMetadata({
  oauthMetadata: {
    issuer: oauthProvider.issuer,
    authorization_endpoint: new URL(`${OAUTH_PREFIX}/authorize`, oauthProvider.issuer).href,
    token_endpoint: new URL(`${OAUTH_PREFIX}/token`, oauthProvider.issuer).href,
    response_types_supported: ['code'],
  },
  resourceServerUrl: new URL(mcpResourceUrl),
  scopesSupported: [MCP_SCOPE],
  resourceName: 'Mon Garde-Manger',
  dangerouslyAllowInsecureIssuerUrl: new URL(oauthProvider.issuer).protocol === 'http:',
})

export const protectedResourceMetadataUrl = getOAuthProtectedResourceMetadataUrl(
  new URL(mcpResourceUrl)
)
