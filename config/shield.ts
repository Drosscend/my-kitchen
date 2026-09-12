import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/shield'
import env from '#start/env'

/**
 * Origin of the self-hosted Umami instance, allowed as a script and
 * beacon source when configured.
 */
const umamiScriptUrl = env.get('UMAMI_SCRIPT_URL')
const umamiOrigin = umamiScriptUrl ? new URL(umamiScriptUrl).origin : null

const shieldConfig = defineConfig({
  /**
   * Content-Security-Policy, production only: the Vite dev server
   * relies on inline scripts (React refresh preamble) that a strict
   * policy would block.
   */
  csp: {
    enabled: app.inProduction,

    directives: {
      defaultSrc: [`'self'`],
      scriptSrc: [`'self'`, '@nonce', ...(umamiOrigin ? [umamiOrigin] : [])],
      /**
       * unsafe-inline is required for style attributes: Base UI and
       * the toaster position their elements with inline styles.
       */
      styleSrc: [`'self'`, `'unsafe-inline'`],
      imgSrc: [`'self'`, 'data:'],
      connectSrc: [`'self'`, ...(umamiOrigin ? [umamiOrigin] : [])],
      objectSrc: [`'none'`],
      baseUri: [`'self'`],
      formAction: [`'self'`],
    },

    reportOnly: false,
  },

  /**
   * Configure CSRF protection options. Refer documentation
   * to learn more.
   */
  csrf: {
    /**
     * Enable CSRF token verification for state-changing requests.
     */
    enabled: true,

    /**
     * Route patterns to exclude from CSRF checks.
     * Useful for external webhooks or API endpoints.
     */
    exceptRoutes: ['/cook/:code/state'],

    /**
     * Expose an encrypted XSRF-TOKEN cookie for frontend HTTP clients.
     */
    enableXsrfCookie: true,

    /**
     * HTTP methods protected by CSRF validation.
     */
    methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  },

  /**
   * Control how your website should be embedded inside
   * iframes.
   */
  xFrame: {
    /**
     * Enable the X-Frame-Options header.
     */
    enabled: true,

    /**
     * Block all framing attempts. Default value is DENY.
     */
    action: 'DENY',
  },

  /**
   * Force browser to always use HTTPS.
   */
  hsts: {
    /**
     * Enable the Strict-Transport-Security header.
     */
    enabled: true,

    /**
     * HSTS policy duration remembered by browsers.
     */
    maxAge: '180 days',
  },

  /**
   * Disable browsers from sniffing content types and rely only
   * on the response content-type header.
   */
  contentTypeSniffing: {
    /**
     * Enable X-Content-Type-Options: nosniff.
     */
    enabled: true,
  },
})

export default shieldConfig
