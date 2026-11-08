import { useRouter } from '@adonisjs/inertia/react'
import { type Ingredient } from '~/inventory/catalog'

export const VISIT_OPTIONS = { preserveScroll: true, preserveState: true } as const

type IngredientChanges = Partial<Pick<Ingredient, 'name' | 'quantity'>>

export function useIngredientActions(ingredient: Ingredient) {
  const router = useRouter()
  const routeParams = { id: ingredient.id }

  function update(changes: IngredientChanges) {
    router.visit({ route: 'inventory.update', routeParams }, { ...VISIT_OPTIONS, data: changes })
  }

  function updateField(field: 'unit' | 'category' | 'state', value: string) {
    if (value !== ingredient[field]) {
      router.visit(
        { route: 'inventory.update', routeParams },
        { ...VISIT_OPTIONS, data: { [field]: value } }
      )
    }
  }

  function adjust(delta: number) {
    router.visit({ route: 'inventory.adjust', routeParams }, { ...VISIT_OPTIONS, data: { delta } })
  }

  function destroy() {
    router.visit({ route: 'inventory.destroy', routeParams }, VISIT_OPTIONS)
  }

  return { update, updateField, adjust, destroy }
}
