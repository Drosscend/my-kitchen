import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'

/**
 * The document format assistants produce and the import reads, kept
 * from the previous site: snake_case keys, `id` as the mention ref.
 */
export const recipeDocumentSchema = vine.object({
  title: vine.string().trim().minLength(1).maxLength(200),
  description: vine.string().trim().optional(),
  base_servings: vine.number().positive().optional(),
  ingredients: vine.array(
    vine.object({
      id: vine.string().trim().minLength(1).maxLength(100),
      name: vine.string().trim().minLength(1).maxLength(200),
      amount: vine.number().min(0).optional(),
      unit: vine.string().trim().maxLength(50).optional(),
    })
  ),
  steps: vine.array(
    vine.object({
      id: vine.string().trim().minLength(1).maxLength(100),
      title: vine.string().trim().maxLength(200).optional(),
      content: vine.string().trim().minLength(1),
      timer_seconds: vine.number().positive().optional(),
    })
  ),
  notes: vine.string().trim().optional(),
})

export type RecipeDocument = Infer<typeof recipeDocumentSchema>

export const recipeDocumentsValidator = vine.create(vine.array(recipeDocumentSchema))
