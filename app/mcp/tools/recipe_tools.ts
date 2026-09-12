import app from '@adonisjs/core/services/app'
import { z } from 'zod'
import { toolError, toolResult } from '#app/mcp/tool_result'
import { invalidRecipeMessage, recipeErrorMessages } from '#app/recipes/error_messages'
import { AddRecipe } from '#recipes/actions/add_recipe'
import { DeleteRecipe } from '#recipes/actions/delete_recipe'
import { UpdateRecipe } from '#recipes/actions/update_recipe'
import { RecipeLibraryQuery } from '#recipes/queries/recipe_library_query'
import { RecipeQuery } from '#recipes/queries/recipe_query'
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type { Recipe, RecipeContentInput } from '#recipes/domain/recipe'
import type { RecipeView } from '#recipes/queries/recipe_query'
import type { McpServer } from '@modelcontextprotocol/server'

/**
 * The document assistants send: `id` is the ref a step mentions as
 * "{id}", "{timer}" stands for the step's own timer.
 */
const recipeDocument = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  base_servings: z.number().int().positive().optional().describe('Portions de base, 4 par défaut'),
  ingredients: z.array(
    z.object({
      id: z.string().min(1).max(100).describe('Clé courte mentionnée dans les étapes comme {id}'),
      name: z.string().min(1).max(200),
      amount: z.number().min(0).optional(),
      unit: z.string().max(50).optional(),
    })
  ),
  steps: z.array(
    z.object({
      id: z.string().min(1).max(100),
      title: z.string().max(200).optional(),
      content: z
        .string()
        .min(1)
        .describe('Texte de l’étape, avec {id} pour un ingrédient et {timer} pour son chrono'),
      timer_seconds: z.number().int().positive().optional(),
    })
  ),
  notes: z.string().optional().describe('Notes libres, **gras** autorisé'),
})

const recipeOutput = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  base_servings: z.number(),
  notes: z.string().nullable(),
  ingredients: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      amount: z.number().nullable(),
      unit: z.string().nullable(),
    })
  ),
  steps: z.array(
    z.object({
      id: z.string(),
      title: z.string().nullable(),
      content: z.string(),
      timer_seconds: z.number().nullable(),
    })
  ),
})

type RecipeDocument = z.infer<typeof recipeDocument>

export function toRecipeContent(document: RecipeDocument): RecipeContentInput {
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

function toOutput(recipe: Recipe | RecipeView) {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    base_servings: recipe.baseServings,
    notes: recipe.notes,
    ingredients: recipe.ingredients.map((ingredient) => ({
      id: ingredient.ref,
      name: ingredient.name,
      amount: ingredient.amount,
      unit: ingredient.unit,
    })),
    steps: recipe.steps.map((step) => ({
      id: step.ref,
      title: step.title,
      content: step.content,
      timer_seconds: step.timerSeconds,
    })),
  }
}

export async function registerRecipeTools(server: McpServer, userId: UserIdentifier) {
  const [library, recipeQuery, addRecipe, updateRecipe, deleteRecipe] = await Promise.all([
    app.container.make(RecipeLibraryQuery),
    app.container.make(RecipeQuery),
    app.container.make(AddRecipe),
    app.container.make(UpdateRecipe),
    app.container.make(DeleteRecipe),
  ])

  server.registerTool(
    'list_recipes',
    {
      title: 'Lister les recettes',
      description: 'Liste les recettes de la bibliothèque avec leur résumé.',
      inputSchema: z.object({}),
      outputSchema: z.object({
        recipes: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            description: z.string().nullable(),
            ingredientCount: z.number(),
            stepCount: z.number(),
          })
        ),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => toolResult({ recipes: await library.execute(userId) })
  )

  server.registerTool(
    'get_recipe',
    {
      title: 'Lire une recette',
      description: 'Renvoie une recette complète : ingrédients, étapes, notes.',
      inputSchema: z.object({ id: z.string() }),
      outputSchema: z.object({ recipe: recipeOutput }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ id }) => {
      const recipe = await recipeQuery.execute(userId, id)
      return recipe
        ? toolResult({ recipe: toOutput(recipe) })
        : toolError(recipeErrorMessages.recipe_not_found)
    }
  )

  server.registerTool(
    'add_recipe',
    {
      title: 'Ajouter une recette',
      description: 'Ajoute une recette à la bibliothèque, au format document.',
      inputSchema: z.object({ recipe: recipeDocument }),
      outputSchema: z.object({ recipe: recipeOutput }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    },
    async ({ recipe }) => {
      const result = await addRecipe.execute({ userId, content: toRecipeContent(recipe) })
      return result.ok
        ? toolResult({ recipe: toOutput(result.value) })
        : toolError(invalidRecipeMessage(result.error))
    }
  )

  server.registerTool(
    'update_recipe',
    {
      title: 'Remplacer une recette',
      description: 'Remplace entièrement une recette existante par le document fourni.',
      inputSchema: z.object({ id: z.string(), recipe: recipeDocument }),
      outputSchema: z.object({ recipe: recipeOutput }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ id, recipe }) => {
      const result = await updateRecipe.execute({ userId, id, content: toRecipeContent(recipe) })

      if (result.ok) {
        return toolResult({ recipe: toOutput(result.value) })
      }

      return toolError(
        result.error.type === 'recipe_not_found'
          ? recipeErrorMessages.recipe_not_found
          : invalidRecipeMessage(result.error)
      )
    }
  )

  server.registerTool(
    'delete_recipe',
    {
      title: 'Supprimer une recette',
      description: 'Supprime une recette de la bibliothèque.',
      inputSchema: z.object({ id: z.string() }),
      outputSchema: z.object({ deleted: z.boolean() }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ id }) => {
      const result = await deleteRecipe.execute({ userId, id })
      return result.ok
        ? toolResult({ deleted: true })
        : toolError(recipeErrorMessages[result.error.type])
    }
  )
}
