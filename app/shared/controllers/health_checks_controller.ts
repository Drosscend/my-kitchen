import env from '#start/env'
import { healthChecks } from '#start/health'
import type { HttpContext } from '@adonisjs/core/http'

export default class HealthChecksController {
  /**
   * When MONITORING_SECRET is configured, the detailed report is
   * reserved to callers presenting it in the x-monitoring-secret
   * header; anyone else only gets the bare status.
   */
  async execute({ request, response }: HttpContext) {
    const report = await healthChecks.run()
    const secret = env.get('MONITORING_SECRET')

    if (secret && request.header('x-monitoring-secret') !== secret) {
      return report.isHealthy ? response.ok('ok') : response.serviceUnavailable('unhealthy')
    }

    return report.isHealthy ? response.ok(report) : response.serviceUnavailable(report)
  }
}
