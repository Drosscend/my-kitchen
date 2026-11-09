import app from '@adonisjs/core/services/app'
import { z } from 'zod'
import { ingredientErrorMessages } from '#app/inventory/error_messages'
import { toolError, toolResult } from '#app/mcp/tool_result'
import { AddIngredient } from '#inventory/actions/add_ingredient'
import { AddIngredientBatch } from '#inventory/actions/add_ingredient_batch'
import { ConsumeIngredients } from '#inventory/actions/consume_ingredients'
import { RemoveIngredient } from '#inventory/actions/remove_ingredient'
import { UpdateIngredient } from '#inventory/actions/update_ingredient'
import { UpdateIngredientBatch } from '#inventory/actions/update_ingredient_batch'
import {
  EXPIRY_KIND_VALUES,
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
const expiryKind = z
  .enum(EXPIRY_KIND_VALUES)
  .describe("use_by : DLC, à consommer jusqu'au ; best_before : DDM, de préférence avant")
const expiryStatus = z
  .enum(['expired', 'soon', 'check', 'ok', 'none'])
  .describe(
    'expired : DLC dépassée ; soon : bientôt périmé ; check : DDM dépassée ; ok ; none : sans date ou congelé'
  )
const expiresOn = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .describe('Date de péremption au format AAAA-MM-JJ')

const batchOutput = z.object({
  id: z.string(),
  quantity: z.number(),
  expiresOn: z.string().nullable(),
  expiryKind: expiryKind.nullable(),
})

const ingredientOutput = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number(),
  unit,
  category,
  state,
  lowStockThreshold: z.number(),
  batches: z.array(batchOutput),
})

const ingredientListOutput = z.object({
  ingredients: z.array(
    ingredientOutput.extend({
      lowStock: z.boolean(),
      perishable: z.boolean(),
      expiryStatus,
      expiresOn: z.string().nullable(),
      daysLeft: z.number().nullable(),
      updatedAt: z.string(),
      batches: z.array(batchOutput.extend({ expiryStatus, daysLeft: z.number().nullable() })),
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
    lowStockThreshold: ingredient.lowStockThreshold,
    batches: ingredient.batches.map((batch) => ({
      id: batch.id,
      quantity: batch.quantity,
      expiresOn: batch.expiry?.on ?? null,
      expiryKind: batch.expiry?.kind ?? null,
    })),
  }
}

const categoryHelp = INGREDIENT_CATEGORY_VALUES.map(
  (value) => `${value} (${INGREDIENT_CATEGORIES[value].label})`
).join(', ')

/**
 * The pantry as tools, every one scoped to the token's owner.
 */
export async function registerInventoryTools(server: McpServer, userId: UserIdentifier) {
  const [
    inventory,
    addIngredient,
    updateIngredient,
    addIngredientBatch,
    updateIngredientBatch,
    consumeIngredients,
    removeIngredient,
  ] = await Promise.all([
    app.container.make(InventoryQuery),
    app.container.make(AddIngredient),
    app.container.make(UpdateIngredient),
    app.container.make(AddIngredientBatch),
    app.container.make(UpdateIngredientBatch),
    app.container.make(ConsumeIngredients),
    app.container.make(RemoveIngredient),
  ])

  server.registerTool(
    'list_ingredients',
    {
      title: 'Lister le garde-manger',
      description: `Liste les ingrédients du garde-manger avec leur quantité, leur état (frais ou congelé), les alertes de stock bas et leurs lots, dans l'ordre de consommation. expiryStatus, expiresOn et daysLeft résument le lot le plus urgent. Catégories : ${categoryHelp}.`,
      inputSchema: z.object({
        search: z.string().optional().describe('Filtre sur le nom, insensible à la casse'),
        category: category.optional(),
        state: state.optional(),
        lowStockOnly: z.boolean().optional().describe('Ne garder que les ingrédients en stock bas'),
        expiringWithinDays: z
          .number()
          .int()
          .min(0)
          .optional()
          .describe(
            'Ne garder que les ingrédients frais dont un lot périme dans ce nombre de jours, périmés compris'
          ),
      }),
      outputSchema: ingredientListOutput,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (input) => {
      const ingredients = await inventory.execute(userId, input)

      return toolResult({
        ingredients: ingredients.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
          state: item.state,
          lowStockThreshold: item.lowStockThreshold,
          lowStock: item.lowStock,
          perishable: item.perishable,
          expiryStatus: item.expiryStatus,
          expiresOn: item.expiresOn,
          daysLeft: item.daysLeft,
          updatedAt: item.updatedAt.toISOString(),
          batches: item.batches.map((batch) => ({
            id: batch.id,
            quantity: batch.quantity,
            expiresOn: batch.expiresOn,
            expiryKind: batch.expiryKind,
            expiryStatus: batch.expiryStatus,
            daysLeft: batch.daysLeft,
          })),
        })),
      })
    }
  )

  server.registerTool(
    'add_ingredient',
    {
      title: 'Ajouter un ingrédient',
      description:
        'Ajoute un ingrédient au garde-manger. Pour racheter un ingrédient déjà présent, préférer add_ingredient_batch. Sans expiryKind, une date prend le type par défaut de la catégorie.',
      inputSchema: z.object({
        name: z.string().min(1).max(100),
        quantity: z.number().min(0),
        unit,
        category,
        state: state.default('fresh'),
        lowStockThreshold: z
          .number()
          .min(0)
          .default(0)
          .describe("Stock bas sous cette quantité, dans l'unité de l'ingrédient ; 0 : jamais"),
        expiresOn: expiresOn.optional(),
        expiryKind: expiryKind.optional(),
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
        "Modifie un ingrédient : quantité absolue, unité, catégorie, état, seuil de stock bas ou nom. Une baisse vide d'abord les lots qui périment le plus tôt, une hausse rejoint le dernier lot ajouté. Pour retirer ce qui a été consommé, préférer consume_ingredients.",
      inputSchema: z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        quantity: z.number().min(0).optional(),
        unit: unit.optional(),
        category: category.optional(),
        state: state.optional(),
        lowStockThreshold: z
          .number()
          .min(0)
          .optional()
          .describe("Stock bas sous cette quantité, dans l'unité de l'ingrédient ; 0 : jamais"),
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
    'add_ingredient_batch',
    {
      title: 'Ajouter un lot',
      description:
        'Ajoute un lot à un ingrédient existant, avec sa propre date de péremption, par exemple après des courses. Un lot de même date rejoint celui qui existe.',
      inputSchema: z.object({
        id: z.string(),
        quantity: z.number().positive().describe("Quantité du lot, dans l'unité de l'ingrédient"),
        expiresOn: expiresOn.optional(),
        expiryKind: expiryKind.optional(),
      }),
      outputSchema: z.object({ ingredient: ingredientOutput }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    },
    async ({ id, ...batch }) => {
      const result = await addIngredientBatch.execute({ userId, id, batch })

      return result.ok
        ? toolResult({ ingredient: toOutput(result.value) })
        : toolError(ingredientErrorMessages[result.error.type])
    }
  )

  server.registerTool(
    'update_ingredient_batch',
    {
      title: 'Modifier un lot',
      description:
        'Corrige la quantité, la date de péremption ou son type sur un lot. expiresOn à null retire la date.',
      inputSchema: z.object({
        id: z.string(),
        batchId: z.string(),
        quantity: z.number().positive().optional(),
        expiresOn: expiresOn.nullable().optional(),
        expiryKind: expiryKind.optional(),
      }),
      outputSchema: z.object({ ingredient: ingredientOutput }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ id, batchId, ...changes }) => {
      const result = await updateIngredientBatch.execute({ userId, id, batchId, changes })

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
        "Retire les quantités utilisées d'un ou plusieurs ingrédients, par exemple après une recette, en vidant d'abord les lots qui périment le plus tôt. Les quantités ne descendent jamais sous zéro.",
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
