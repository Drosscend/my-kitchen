import { authApiClient } from '@adonisjs/auth/plugins/api_client'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import { inertiaApiClient } from '@adonisjs/inertia/plugins/api_client'
import { sessionApiClient } from '@adonisjs/session/plugins/api_client'
import { shieldApiClient } from '@adonisjs/shield/plugins/api_client'
import { apiClient } from '@japa/api-client'
import { assert } from '@japa/assert'
import { pluginAdonisJS } from '@japa/plugin-adonisjs'
import env from '#start/env'
import type { Config } from '@japa/runner/types'

export const plugins: Config['plugins'] = [
  assert(),
  apiClient(),
  pluginAdonisJS(app),
  sessionApiClient(app),
  shieldApiClient(),
  authApiClient(app),
  inertiaApiClient(app),
]

/**
 * The functional suite migrates and resets the configured database, so
 * pointing it at the development one would wipe it. Fail before the
 * first migration rather than after.
 */
function assertTestDatabase() {
  const database = new URL(env.get('DATABASE_URL').release()).pathname

  if (!database.endsWith('_test')) {
    throw new Error(`Refusing to run the suite on "${database}": check .env.test`)
  }
}

export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [assertTestDatabase],
  teardown: [],
}

export const configureSuite: Config['configureSuite'] = (suite) => {
  if (suite.name === 'functional') {
    return suite.setup(() => testUtils.httpServer().start())
  }
}
