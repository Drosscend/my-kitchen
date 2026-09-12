import { liveness } from '#start/health'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Read by the Docker healthcheck: the process answers and reaches the
 * database. Disk and memory belong to the /health report, restarting
 * the container would not fix them.
 */
export default class LivenessController {
  async execute({ response }: HttpContext) {
    const report = await liveness.run()

    return report.isHealthy ? response.ok('ok') : response.serviceUnavailable('unhealthy')
  }
}
