import { readFile } from 'node:fs/promises'
import { inject } from '@adonisjs/core'
import vine, { errors as vineErrors } from '@vinejs/vine'
import { invalidRecipeMessage } from '#app/recipes/error_messages'
import { recipeDocumentsValidator, type RecipeDocument } from '#app/recipes/validators'
import { ImportRecipes } from '#recipes/actions/import_recipes'
import type { RecipeContentInput } from '#recipes/domain/recipe'
import type { HttpContext } from '@adonisjs/core/http'

const INVALID_INPUT =
  'Aucune recette valide : il faut un title, des ingredients et des steps avec un id chacun'

function toContent(document: RecipeDocument): RecipeContentInput {
  return {
    title: document.title,
    description: document.description,
    baseServings: document.base_servings,
    notes: document.notes,
    ingredients: document.ingredients.map((ingredient) => ({
      ref: ingredient.id,
      name: ingredient.name,
      amount: ingredient.amount,
      unit: ingredient.unit,
    })),
    steps: document.steps.map((step) => ({
      ref: step.id,
      title: step.title,
      content: step.content,
      timerSeconds: step.timer_seconds,
    })),
  }
}

/**
 * Takes a JSON file or pasted text holding one recipe or a list.
 */
@inject()
export default class ImportRecipesController {
  static readonly validator = vine.create({
    json: vine.string().trim().optional(),
    file: vine.file({ extnames: ['json'], size: '2mb' }).optional(),
  })

  constructor(private readonly importRecipes: ImportRecipes) {}

  async execute({ request, response, auth, session }: HttpContext) {
    const { json, file } = await request.validateUsing(ImportRecipesController.validator)
    const text = file?.tmpPath ? await readFile(file.tmpPath, 'utf8') : json
    const documents = text ? await this.#parse(text) : null

    if (!documents || documents.length === 0) {
      session.flash('error', INVALID_INPUT)
      return response.redirect().toRoute('recipes.index')
    }

    const result = await this.importRecipes.execute({
      userId: auth.getUserOrFail().getIdentifier(),
      recipes: documents.map(toContent),
    })

    if (!result.ok) {
      session.flash('error', invalidRecipeMessage(result.error))
      return response.redirect().toRoute('recipes.index')
    }

    const count = result.value.length
    session.flash('success', count > 1 ? `${count} recettes importées` : 'Recette importée')
    return response.redirect().toRoute('recipes.index')
  }

  async #parse(text: string) {
    try {
      const parsed: unknown = JSON.parse(text)
      return await recipeDocumentsValidator.validate(Array.isArray(parsed) ? parsed : [parsed])
    } catch (error) {
      if (error instanceof SyntaxError || error instanceof vineErrors.E_VALIDATION_ERROR) {
        return null
      }
      throw error
    }
  }
}
