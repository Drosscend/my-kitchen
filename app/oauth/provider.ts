import { generateKeyPairSync } from 'node:crypto'
import logger from '@adonisjs/core/services/logger'
import Provider, { errors, interactionPolicy, type Configuration } from 'oidc-provider'
import { OAuthAdapter } from '#app/oauth/adapter'
import { resolvesToPublicAddresses } from '#app/oauth/public_host'
import { appUrl } from '#config/app'
import env from '#start/env'

/**
 * The MCP endpoint is the only resource this server issues tokens for,
 * under a single scope.
 */
export const mcpResourceUrl = new URL('/mcp', appUrl).href
export const MCP_SCOPE = 'mcp'

/**
 * Every route of the provider lives under this prefix, except the two
 * discovery documents it serves at the root of the issuer.
 */
export const OAUTH_PREFIX = '/oauth'
export const OAUTH_DISCOVERY_PATHS = [
  '/.well-known/oauth-authorization-server',
  '/.well-known/openid-configuration',
]

const DAY = 24 * 60 * 60

/**
 * The application session decides who signs in: every authorization
 * goes through the consent page, which hands back the account of the
 * logged in user.
 */
function buildPolicy() {
  const policy = interactionPolicy.base()
  policy
    .get('login')
    ?.checks.add(
      new interactionPolicy.Check(
        'application_session',
        'The application session resolves the account',
        (ctx) =>
          ctx.oidc.result?.login
            ? interactionPolicy.Check.NO_NEED_TO_PROMPT
            : interactionPolicy.Check.REQUEST_PROMPT
      )
    )
  return policy
}

/**
 * Nothing this server signs outlives the process: access tokens are
 * opaque, and an ID token is only checked when the client receives it.
 * A key generated at boot spares a secret to provision. RS256 is the
 * algorithm clients get when they register without choosing one.
 */
function signingKeys() {
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  return { keys: [{ ...privateKey.export({ format: 'jwk' }), use: 'sig', alg: 'RS256' }] }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`)
}

const configuration: Configuration = {
  adapter: OAuthAdapter,
  jwks: signingKeys(),
  cookies: { keys: [env.get('APP_KEY').release()] },
  findAccount: (_ctx, sub) => ({ accountId: sub, claims: () => ({ sub }) }),

  /**
   * Assistants register themselves (DCR) or point at their metadata
   * document (CIMD); most are public clients proving the code exchange
   * with PKCE.
   */
  clientDefaults: {
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
  },
  clientAuthMethods: ['none', 'client_secret_basic', 'client_secret_post', 'private_key_jwt'],
  responseTypes: ['code'],
  clientBasedCORS: () => true,
  pkce: { required: () => true },

  features: {
    devInteractions: { enabled: false },
    rpInitiatedLogout: { enabled: false },
    userinfo: { enabled: false },
    revocation: { enabled: true },
    registration: { enabled: true, issueRegistrationAccessToken: false },
    clientIdMetadataDocument: {
      enabled: true,
      ack: 'draft-02',
      allowFetch: async (_ctx, clientId) => resolvesToPublicAddresses(new URL(clientId).hostname),
    },
    resourceIndicators: {
      enabled: true,
      defaultResource: () => mcpResourceUrl,
      useGrantedResource: () => true,
      getResourceServerInfo: (_ctx, resourceIndicator) => {
        if (resourceIndicator !== mcpResourceUrl) {
          throw new errors.InvalidTarget()
        }
        return { scope: MCP_SCOPE, accessTokenFormat: 'opaque', accessTokenTTL: 60 * 60 }
      },
    },
  },

  /**
   * Assistants keep their access for as long as they use it: refresh
   * tokens rotate on every use, each one valid 30 days.
   */
  expiresWithSession: () => false,
  issueRefreshToken: (_ctx, client) => client.grantTypeAllowed('refresh_token'),
  ttl: {
    AccessToken: 60 * 60,
    AuthorizationCode: 60,
    Interaction: 60 * 60,
    Session: DAY,
    RefreshToken: 30 * DAY,
    Grant: 365 * DAY,
  },

  interactions: {
    policy: buildPolicy(),
    url: (_ctx, interaction) => `${OAUTH_PREFIX}/interaction/${interaction.uid}`,
  },

  routes: {
    authorization: `${OAUTH_PREFIX}/authorize`,
    token: `${OAUTH_PREFIX}/token`,
    registration: `${OAUTH_PREFIX}/register`,
    revocation: `${OAUTH_PREFIX}/revoke`,
    jwks: `${OAUTH_PREFIX}/jwks`,
    pushed_authorization_request: `${OAUTH_PREFIX}/request`,
  },

  renderError: (ctx, out) => {
    const description = out.error_description ?? out.error
    ctx.type = 'html'
    ctx.body = `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><title>Connexion impossible</title></head>
<body>
<h1>Connexion impossible</h1>
<p>L'assistant n'a pas pu être relié à Mon Garde-Manger. Relance la connexion depuis l'assistant.</p>
<pre>${escapeHtml(String(description))}</pre>
</body>
</html>`
  },
}

export const oauthProvider = new Provider(appUrl, configuration)

/**
 * Dokploy terminates TLS in front of the app: trust its forwarded
 * protocol so the provider builds https URLs and secure cookies.
 */
oauthProvider.proxy = true

oauthProvider.on('server_error', (_ctx, error) => {
  logger.error({ err: error }, 'oauth provider error')
})

export const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

/**
 * Whether two http loopback URIs differ by their port only.
 */
function sameLoopbackRedirect(allowed: string, requested: string) {
  const allowedUrl = URL.parse(allowed)
  const requestedUrl = URL.parse(requested)

  return (
    allowedUrl?.protocol === 'http:' &&
    requestedUrl?.protocol === 'http:' &&
    LOOPBACK_HOSTS.has(allowedUrl.hostname) &&
    allowedUrl.hostname === requestedUrl.hostname &&
    allowedUrl.pathname === requestedUrl.pathname &&
    allowedUrl.search === requestedUrl.search
  )
}

/**
 * Native clients listen on an ephemeral port (RFC 8252). oidc-provider
 * ignores the port only for clients declared native, but the metadata
 * document of Claude Code declares no application type: match loopback
 * redirects without their port for every client.
 */
const { redirectUriAllowed } = oauthProvider.Client.prototype
oauthProvider.Client.prototype.redirectUriAllowed = function (redirectUri) {
  return (
    redirectUriAllowed.call(this, redirectUri) ||
    this.redirectUris?.some((allowed) => sameLoopbackRedirect(allowed, redirectUri)) === true
  )
}
