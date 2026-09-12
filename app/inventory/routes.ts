import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const InventoryController = () => import('#app/inventory/controllers/inventory_controller')
const AddIngredientController = () => import('#app/inventory/controllers/add_ingredient_controller')
const UpdateIngredientController = () =>
  import('#app/inventory/controllers/update_ingredient_controller')
const AdjustIngredientQuantityController = () =>
  import('#app/inventory/controllers/adjust_ingredient_quantity_controller')
const RemoveIngredientController = () =>
  import('#app/inventory/controllers/remove_ingredient_controller')
const ImportInventoryController = () =>
  import('#app/inventory/controllers/import_inventory_controller')
const ExportInventoryController = () =>
  import('#app/inventory/controllers/export_inventory_controller')

router
  .group(() => {
    router.get('/', [InventoryController, 'render']).as('inventory.index')
    router.post('inventory', [AddIngredientController, 'execute']).as('inventory.store')
    router.post('inventory/import', [ImportInventoryController, 'execute']).as('inventory.import')
    router
      .get('inventory/export/:format', [ExportInventoryController, 'execute'])
      .as('inventory.export')
      .where('format', /^(json|markdown)$/)
    router.patch('inventory/:id', [UpdateIngredientController, 'execute']).as('inventory.update')
    router
      .post('inventory/:id/adjust', [AdjustIngredientQuantityController, 'execute'])
      .as('inventory.adjust')
    router.delete('inventory/:id', [RemoveIngredientController, 'execute']).as('inventory.destroy')
  })
  .use([middleware.auth(), middleware.verified()])
