import { type Recipe, type RecipeIngredient, type RecipeStep } from '~/recipes/types'

const FRACTIONS: [number, string][] = [
  [1 / 8, '⅛'],
  [1 / 4, '¼'],
  [1 / 3, '⅓'],
  [3 / 8, '⅜'],
  [1 / 2, '½'],
  [5 / 8, '⅝'],
  [2 / 3, '⅔'],
  [3 / 4, '¾'],
  [7 / 8, '⅞'],
]

export function formatAmount(value: number) {
  if (value === 0) {
    return '0'
  }

  if (Number.isInteger(value)) {
    return String(value)
  }

  const whole = Math.floor(value)
  const fraction = value - whole
  let closest = ''
  let smallestGap = Number.POSITIVE_INFINITY

  for (const [ratio, symbol] of FRACTIONS) {
    const gap = Math.abs(fraction - ratio)

    if (gap < smallestGap) {
      smallestGap = gap
      closest = symbol
    }
  }

  if (smallestGap < 0.05) {
    return whole > 0 ? `${whole}${closest}` : closest
  }

  return value < 10 ? value.toFixed(1).replace(/\.0$/, '') : String(Math.round(value))
}

export function formatDuration(seconds: number) {
  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return rest > 0 ? `${minutes}min ${rest}s` : `${minutes}min`
}

export function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

export function formatIngredient(ingredient: RecipeIngredient, scale: number) {
  return [formatAmount((ingredient.amount ?? 0) * scale), ingredient.unit ?? '', ingredient.name]
    .filter(Boolean)
    .join(' ')
}

export function ingredientsByRef(ingredients: RecipeIngredient[]) {
  return new Map(ingredients.map((ingredient) => [ingredient.ref, ingredient]))
}

/**
 * Steps mention ingredients as "{ref}" and their own timer as "{timer}".
 * The text is split around the mentions so each can be rendered.
 */
export type StepPart =
  | { kind: 'text'; text: string }
  | { kind: 'timer' }
  | { kind: 'ingredient'; ingredient: RecipeIngredient }

export function splitStep(
  step: RecipeStep,
  ingredients: Map<string, RecipeIngredient>,
  options: { appendTimer: boolean }
): StepPart[] {
  const hasTimer = Boolean(step.timerSeconds)
  const text =
    options.appendTimer && hasTimer && !step.content.includes('{timer}')
      ? `${step.content} {timer}`
      : step.content
  const parts: StepPart[] = []
  let lastIndex = 0

  for (const match of text.matchAll(/\{([^}]+)\}/g)) {
    if (match.index > lastIndex) {
      parts.push({ kind: 'text', text: text.slice(lastIndex, match.index) })
    }

    const ref = match[1]
    const ingredient = ingredients.get(ref)

    if (ref === 'timer' && hasTimer) {
      parts.push({ kind: 'timer' })
    } else if (ingredient) {
      parts.push({ kind: 'ingredient', ingredient })
    } else {
      parts.push({ kind: 'text', text: match[0] })
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push({ kind: 'text', text: text.slice(lastIndex) })
  }

  return parts
}

export function resolveStep(
  step: RecipeStep,
  ingredients: Map<string, RecipeIngredient>,
  scale: number
) {
  return splitStep(step, ingredients, { appendTimer: false })
    .map((part) => {
      switch (part.kind) {
        case 'text':
          return part.text
        case 'timer':
          return formatDuration(step.timerSeconds ?? 0)
        case 'ingredient':
          return formatIngredient(part.ingredient, scale)
      }
    })
    .join('')
}

export function formatRecipeText(recipe: Recipe, scale: number) {
  const ingredients = ingredientsByRef(recipe.ingredients)
  const lines = [recipe.title]

  if (recipe.description) {
    lines.push(recipe.description)
  }

  if (recipe.ingredients.length > 0) {
    lines.push('', 'INGRÉDIENTS')
    lines.push(
      ...recipe.ingredients.map((ingredient) => `• ${formatIngredient(ingredient, scale)}`)
    )
  }

  if (recipe.steps.length > 0) {
    lines.push('', 'ÉTAPES')
    lines.push(
      ...recipe.steps.map(
        (step, index) =>
          `${index + 1}. ${step.title ? `${step.title} : ` : ''}${resolveStep(step, ingredients, scale)}`
      )
    )
  }

  if (recipe.notes) {
    lines.push('', 'NOTES', recipe.notes)
  }

  return lines.join('\n').trim()
}
