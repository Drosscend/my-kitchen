import vine from '@vinejs/vine'

const ref = vine.string().trim().minLength(1).maxLength(100)

export const recipeValidator = vine.create({
  title: vine.string().trim().minLength(1).maxLength(200),
  description: vine.string().trim().maxLength(1000).nullable(),
  baseServings: vine.number().withoutDecimals().positive().max(100),
  notes: vine.string().trim().maxLength(5000).nullable(),
  ingredients: vine.array(
    vine.object({
      ref,
      name: vine.string().trim().minLength(1).maxLength(200),
      amount: vine.number().min(0).nullable(),
      unit: vine.string().trim().maxLength(50).nullable(),
    })
  ),
  steps: vine.array(
    vine.object({
      ref,
      title: vine.string().trim().maxLength(200).nullable(),
      content: vine.string().trim().minLength(1).maxLength(5000),
      timerSeconds: vine.number().withoutDecimals().positive().nullable(),
    })
  ),
})
