import { readFile } from 'node:fs/promises'
import { inject } from '@adonisjs/core'
import vine, { errors as vineErrors } from '@vinejs/vine'
import { ingredientErrorMessages } from '#app/inventory/error_messages'
import { ingredientSchema } from '#app/inventory/validators'
import { ReplaceInventory } from '#inventory/actions/replace_inventory'
import type { HttpContext } from '@adonisjs/core/http'

const INVALID_FILE = 'Le fichier doit être un export JSON du garde-manger'

@inject()
export default class ImportInventoryController {
  static readonly validator = vine.create({
    file: vine.file({ extnames: ['json'], size: '2mb' }),
  })

  static readonly contents = vine.create(vine.array(ingredientSchema))

  constructor(private readonly replaceInventory: ReplaceInventory) {}

  async execute({ request, response, auth, session }: HttpContext) {
    const { file } = await request.validateUsing(ImportInventoryController.validator)
    const ingredients = await this.#parse(file.tmpPath)

    if (!ingredients) {
      session.flash('error', INVALID_FILE)
      return response.redirect().toRoute('inventory.index')
    }

    const result = await this.replaceInventory.execute({
      userId: auth.getUserOrFail().getIdentifier(),
      ingredients,
    })

    if (!result.ok) {
      session.flash('error', ingredientErrorMessages[result.error.type])
      return response.redirect().toRoute('inventory.index')
    }

    session.flash('success', `${result.value} ingrédients importés`)
    return response.redirect().toRoute('inventory.index')
  }

  async #parse(path: string | undefined) {
    if (!path) {
      return null
    }

    try {
      const parsed: unknown = JSON.parse(await readFile(path, 'utf8'))
      return await ImportInventoryController.contents.validate(parsed)
    } catch (error) {
      if (error instanceof SyntaxError || error instanceof vineErrors.E_VALIDATION_ERROR) {
        return null
      }
      throw error
    }
  }
}
