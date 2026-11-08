import { BaseCommand, flags } from '@adonisjs/core/ace'
import { SEED_INGREDIENTS, SEED_RECIPES, type SeedBatch } from '#database/seed_data'
import { EmailAddress } from '#identity/domain/email_address'
import { UserRepository } from '#identity/repositories/user_repository'
import { AddIngredient } from '#inventory/actions/add_ingredient'
import { AddIngredientBatch } from '#inventory/actions/add_ingredient_batch'
import { today } from '#inventory/domain/expiry'
import { AddRecipe } from '#recipes/actions/add_recipe'
import { db } from '#shared/services/db'
import type { CommandOptions } from '@adonisjs/core/types/ace'

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000

function expiresOn({ inDays }: SeedBatch, from: string) {
  return inDays === null
    ? null
    : new Date(Date.parse(from) + inDays * DAY_IN_MILLISECONDS).toISOString().slice(0, 10)
}

export default class DbSeed extends BaseCommand {
  static commandName = 'db:seed'
  static description = 'Replace the pantry and recipes of a user with sample data'
  static options: CommandOptions = { startApp: true }

  @flags.string({ description: 'Email of the user to fill' })
  declare email?: string

  async run() {
    if (this.app.inProduction) {
      this.logger.error('The db:seed command is disabled in production')
      this.exitCode = 1
      return
    }

    const email = EmailAddress.create(
      this.email ?? (await this.prompt.ask<string>('Which user email should be filled?'))
    )

    if (!email.ok) {
      this.logger.error('The email address is invalid')
      this.exitCode = 1
      return
    }

    const users = await this.app.container.make(UserRepository)
    const user = await users.findUserByEmail(email.value)

    if (!user) {
      this.logger.error('No user for this email, create it first with node ace create:user')
      this.exitCode = 1
      return
    }

    const userId = user.getIdentifier()
    await db.deleteFrom('ingredients').where('user_id', '=', userId.toString()).execute()
    await db.deleteFrom('recipes').where('user_id', '=', userId.toString()).execute()

    const addIngredient = await this.app.container.make(AddIngredient)
    const addBatch = await this.app.container.make(AddIngredientBatch)
    const addRecipe = await this.app.container.make(AddRecipe)
    const from = today()

    for (const { batches, ...ingredient } of SEED_INGREDIENTS) {
      const [first, ...others] = batches
      const added = await addIngredient.execute({
        userId,
        ...ingredient,
        quantity: first?.quantity ?? 0,
        expiresOn: first ? expiresOn(first, from) : null,
      })

      if (!added.ok) {
        throw new Error(`Invalid seed ingredient ${ingredient.name}`)
      }

      for (const batch of others) {
        await addBatch.execute({
          userId,
          id: added.value.id,
          batch: { quantity: batch.quantity, expiresOn: expiresOn(batch, from) },
        })
      }
    }

    for (const content of SEED_RECIPES) {
      const added = await addRecipe.execute({ userId, content })

      if (!added.ok) {
        throw new Error(`Invalid seed recipe ${content.title}`)
      }
    }

    this.logger.success(
      `${SEED_INGREDIENTS.length} ingredients and ${SEED_RECIPES.length} recipes added for ${email.value.toString()}`
    )
  }
}
