import fs from 'node:fs/promises'
import path from 'node:path'
import app from '@adonisjs/core/services/app'
import { Migrator } from 'kysely/migration'
import { FileMigrationProvider } from '#shared/file_migration_provider'
import { db } from '#shared/services/db'

export async function migrateTestDatabase() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({ fs, path, migrationFolder: app.migrationsPath() }),
  })
  const { error } = await migrator.migrateToLatest()

  if (error) {
    throw error
  }
}

/**
 * Every other table hangs off users through cascading foreign keys.
 */
export async function resetDatabase() {
  await db.deleteFrom('users').execute()
}
