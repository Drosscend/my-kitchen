import {
  BaseCheck,
  DiskSpaceCheck,
  HealthChecks,
  MemoryHeapCheck,
  Result,
} from '@adonisjs/core/health'
import { sql } from 'kysely'
import { db } from '#shared/services/db'

class DatabaseCheck extends BaseCheck {
  name = 'Database'

  async run() {
    try {
      await sql`select 1`.execute(db)
      return Result.ok('Database connection is healthy')
    } catch (error) {
      return Result.failed('Database connection failed', error instanceof Error ? error : undefined)
    }
  }
}

export const healthChecks = new HealthChecks().register([
  new DiskSpaceCheck(),
  new MemoryHeapCheck().warnWhenExceeds('400 mb').failWhenExceeds('500 mb'),
  new DatabaseCheck(),
])
