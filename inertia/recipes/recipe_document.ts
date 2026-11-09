import { normalizeText } from '~/recipes/format'
import { type Recipe, type RecipeIngredient, type RecipeStep } from '~/recipes/types'

export interface RecipeDraft {
  title: string
  description: string
  baseServings: number
  notes: string
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
}

export const UNIT_SUGGESTIONS = [
  'g',
  'kg',
  'mL',
  'cL',
  'L',
  'c. à s.',
  'c. à c.',
  'pincée',
  'gousse',
  'tranche',
  'sachet',
  'boîte',
  'verre',
  'brin',
  'feuille',
]

const UNIT_SHORTHANDS = new Map([
  ['gr', 'g'],
  ['cs', 'c. à s.'],
  ['cc', 'c. à c.'],
])

function unitFrom(text: string) {
  const lower = text.toLowerCase()
  const unit = UNIT_SUGGESTIONS.find(
    (candidate) => candidate.toLowerCase() === lower || `${candidate}s` === lower
  )

  if (unit) {
    return unit.toLowerCase() === lower ? unit : lower
  }

  return UNIT_SHORTHANDS.get(lower) ?? null
}

export function draftFrom(recipe?: Recipe): RecipeDraft {
  return {
    title: recipe?.title ?? '',
    description: recipe?.description ?? '',
    baseServings: recipe?.baseServings ?? 4,
    notes: recipe?.notes ?? '',
    ingredients: recipe?.ingredients ?? [],
    steps: recipe?.steps ?? [],
  }
}

/**
 * What the server takes: blank steps are dropped rather than refused.
 */
export function toPayload(draft: RecipeDraft) {
  return {
    title: draft.title.trim(),
    description: draft.description.trim() || null,
    baseServings: draft.baseServings,
    notes: draft.notes.trim() || null,
    ingredients: draft.ingredients,
    steps: draft.steps
      .filter((step) => step.content.trim())
      .map((step) => ({ ...step, title: step.title?.trim() || null })),
  }
}

function slugify(value: string) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function uniqueRef(name: string, taken: string[]) {
  const base = slugify(name).slice(0, 80) || 'ingredient'
  let ref = base

  for (let suffix = 2; taken.includes(ref); suffix++) {
    ref = `${base}-${suffix}`
  }

  return ref
}

export function newStep(): RecipeStep {
  return {
    ref: `step-${crypto.randomUUID().slice(0, 8)}`,
    title: null,
    content: '',
    timerSeconds: null,
  }
}

/**
 * Reads "200 g farine", "1/2 citron", "1 1/2 kg de farine", "2 gousses
 * d'ail" or "sel" into an ingredient.
 */
export function parseIngredient(text: string, taken: string[]): RecipeIngredient | null {
  const fraction = /^(?:(\d+)\s+)?(\d+)\s*\/\s*([1-9]\d*)\s*(.*)$/.exec(text.trim())
  const decimal = /^(\d+(?:[.,]\d+)?)?\s*(.*)$/.exec(text.trim())
  const amount = fraction
    ? Number(fraction[1] ?? 0) + Number(fraction[2]) / Number(fraction[3])
    : decimal?.[1]
      ? Number(decimal[1].replace(',', '.'))
      : null
  let rest = fraction?.[4] ?? decimal?.[2] ?? ''
  let unit: string | null = null

  if (amount !== null) {
    const words = rest.split(/\s+/)

    for (let length = Math.min(3, words.length - 1); length > 0; length--) {
      const candidate = unitFrom(words.slice(0, length).join(' '))

      if (candidate) {
        unit = candidate
        rest = words
          .slice(length)
          .join(' ')
          .replace(/^(de |d’|d')/i, '')
        break
      }
    }
  }

  const name = rest.trim()

  if (!name) {
    return null
  }

  return {
    ref: uniqueRef(name, taken),
    name: name.charAt(0).toUpperCase() + name.slice(1),
    amount,
    unit,
  }
}

/**
 * A removed ingredient stays readable in the steps that mentioned it.
 */
export function forgetIngredient(steps: RecipeStep[], ingredient: RecipeIngredient) {
  return steps.map((step) => ({
    ...step,
    content: step.content.replaceAll(`{${ingredient.ref}}`, ingredient.name),
  }))
}

export function move<T>(items: T[], index: number, offset: number) {
  const target = index + offset

  if (target < 0 || target >= items.length) {
    return items
  }

  const next = [...items]
  const [item] = next.splice(index, 1)
  next.splice(target, 0, item)
  return next
}
