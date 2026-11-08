import vine from '@vinejs/vine'
import {
  EXPIRY_KIND_VALUES,
  INGREDIENT_CATEGORY_VALUES,
  INGREDIENT_STATE_VALUES,
  INGREDIENT_UNIT_VALUES,
} from '#inventory/domain/catalog'

export const ingredientFields = {
  name: vine.string().trim().minLength(1).maxLength(100),
  quantity: vine.number().min(0),
  unit: vine.enum(INGREDIENT_UNIT_VALUES),
  category: vine.enum(INGREDIENT_CATEGORY_VALUES),
  state: vine.enum(INGREDIENT_STATE_VALUES),
}

export const expiryFields = {
  expiresOn: vine
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  expiryKind: vine.enum(EXPIRY_KIND_VALUES).optional(),
}
