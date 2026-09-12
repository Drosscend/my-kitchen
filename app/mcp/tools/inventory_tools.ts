import app from '@adonisjs/core/services/app'
import { z } from 'zod'
import { ingredientErrorMessages } from '#app/inventory/error_messages'
import { toolError, toolResult } from '#app/mcp/tool_result'
import { AddIngredient } from '#inventory/actions/add_ingredient'
import { ConsumeIngredients } from '#inventory/actions/consume_ingredients'
import { RemoveIngredient } from '#inventory/actions/remove_ingredient'
import { UpdateIngredient } from '#inventory/actions/update_ingredient'
import {
  INGREDIENT_CATEGORIES,
  INGREDIENT_CATEGORY_VALUES,
  INGREDIENT_STATE_VALUES,
  INGREDIENT_UNIT_VALUES,
} from '#inventory/domain/catalog'
import { InventoryQuery } from '#inventory/queries/inventory_query'
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type { Ingredient } from '#inventory/domain/ingredient'
import type { McpServer } from '@modelcontextprotocol/server'

const category = z.enum(INGREDIENT_CATEGORY_VALUES)
const unit = z.enum(INGREDIENT_UNIT_VALUES)
const state = z.enum(INGREDIENT_STATE_VALUES)

const ingredientOutput = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number(),
  unit,
  category,
  state,
})

const ingredientListOutput = z.object({
  ingredients: z.array(
    ingredientOutput.extend({
      lowStock: z.boolean(),
      perishable: z.boolean(),
      updatedAt: z.string(),
    })
  ),
})

function toOutput(ingredient: Ingredient) {
  return {
    id: ingredient.id,
    name: ingredient.name,
    quantity: ingredient.quantity,
    unit: ingredient.unit,
    category: ingredient.category,
    state: ingredient.state,
  }
}

const categoryHelp = INGREDIENT_CATEGORY_VALUES.map(
  (value) => `${value} (${INGREDIENT_CATEGORIES[value].label})`
).join(', ')

/**
 * The pantry as tools, every one scoped to the token's owner.
 */
export async function registerInventoryTools(server: McpServer, userId: UserIdentifier) {
  const [inventory, addIngredient, updateIngredient, consumeIngredients, removeIngredient] =
    await Promise.all([
      app.container.make(InventoryQuery),
      app.container.make(AddIngredient),
      app.container.make(UpdateIngredient),
      app.container.make(ConsumeIngredients),
      app.container.make(RemoveIngredient),
    ])

  server.registerTool(
    'list_ingredients',
    {
      title: 'Lister le garde-manger',
      description: `Liste les ingrédients du garde-manger avec leur quantité, leur état (frais ou congelé) et les alertes de stock bas. Catégories : ${categoryHelp}.`,
      inputSchema: z.object({
        search: z.string().optional().describe('Filtre sur le nom, insensible à la casse'),
        category: category.optional(),
        state: state.optional(),
        lowStockOnly: z.boolean().optional().describe('Ne garder que les ingrédients en stock bas'),
      }),
      outputSchema: ingredientListOutput,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (input) => {
      const search = input.search?.trim().toLowerCase()
      const ingredients = (await inventory.execute(userId))
        .filter((item) => !search || item.name.toLowerCase().includes(search))
        .filter((item) => !input.category || item.category === input.category)
        .filter((item) => !input.state || item.state === input.state)
        .filter((item) => !input.lowStockOnly || item.lowStock)

      return toolResult({
        ingredients: ingredients.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
          state: item.state,
          lowStock: item.lowStock,
          perishable: item.perishable,
          updatedAt: item.updatedAt.toISOString(),
        })),
      })
    }
  )

  server.registerTool(
    'add_ingredient',
    {
      title: 'Ajouter un ingrédient',
      description: 'Ajoute un ingrédient au garde-manger.',
      inputSchema: z.object({
        name: z.string().min(1).max(100),
        quantity: z.number().min(0),
        unit,
        category,
        state: state.default('fresh'),
      }),
      outputSchema: z.object({ ingredient: ingredientOutput }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    },
    async (input) => {
      const result = await addIngredient.execute({ userId, ...input })

      return result.ok
        ? toolResult({ ingredient: toOutput(result.value) })
        : toolError(ingredientErrorMessages[result.error.type])
    }
  )

  server.registerTool(
    'update_ingredient',
    {
      title: 'Modifier un ingrédient',
      description:
        'Modifie un ingrédient : quantité absolue, unité, catégorie, état ou nom. Pour retirer ce qui a été consommé, préférer consume_ingredients.',
      inputSchema: z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        quantity: z.number().min(0).optional(),
        unit: unit.optional(),
        category: category.optional(),
        state: state.optional(),
      }),
      outputSchema: z.object({ ingredient: ingredientOutput }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ id, ...changes }) => {
      const result = await updateIngredient.execute({ userId, id, changes })

      return result.ok
        ? toolResult({ ingredient: toOutput(result.value) })
        : toolError(ingredientErrorMessages[result.error.type])
    }
  )

  server.registerTool(
    'consume_ingredients',
    {
      title: 'Consommer des ingrédients',
      description:
        "Retire les quantités utilisées d'un ou plusieurs ingrédients, par exemple après une recette. Les quantités ne descendent jamais sous zéro.",
      inputSchema: z.object({
        items: z
          .array(
            z.object({
              id: z.string(),
              quantity: z
                .number()
                .min(0)
                .describe("Quantité consommée, dans l'unité de l'ingrédient"),
            })
          )
          .min(1),
      }),
      outputSchema: z.object({ ingredients: z.array(ingredientOutput) }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    },
    async (input) => {
      const result = await consumeIngredients.execute({ userId, items: input.items })

      return result.ok
        ? toolResult({ ingredients: result.value.map(toOutput) })
        : toolError(`${ingredientErrorMessages[result.error.type]} : ${result.error.id}`)
    }
  )

  server.registerTool(
    'remove_ingredient',
    {
      title: 'Retirer un ingrédient',
      description: 'Supprime un ingrédient du garde-manger.',
      inputSchema: z.object({ id: z.string() }),
      outputSchema: z.object({ removed: z.boolean() }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ id }) => {
      const result = await removeIngredient.execute({ userId, id })

      return result.ok
        ? toolResult({ removed: true })
        : toolError(ingredientErrorMessages[result.error.type])
    }
  )
}
