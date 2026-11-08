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
const AddIngredientBatchController = () =>
  import('#app/inventory/controllers/add_ingredient_batch_controller')
const UpdateIngredientBatchController = () =>
  import('#app/inventory/controllers/update_ingredient_batch_controller')
const RemoveIngredientBatchController = () =>
  import('#app/inventory/controllers/remove_ingredient_batch_controller')
const InventoryMarkdownController = () =>
  import('#app/inventory/controllers/inventory_markdown_controller')

router
  .group(() => {
    router.get('/', [InventoryController, 'render']).as('inventory.index')
    router.post('inventory', [AddIngredientController, 'execute']).as('inventory.store')
    router
      .get('inventory/markdown', [InventoryMarkdownController, 'execute'])
      .as('inventory.markdown')
    router.patch('inventory/:id', [UpdateIngredientController, 'execute']).as('inventory.update')
    router
      .post('inventory/:id/adjust', [AdjustIngredientQuantityController, 'execute'])
      .as('inventory.adjust')
    router.delete('inventory/:id', [RemoveIngredientController, 'execute']).as('inventory.destroy')
    router
      .post('inventory/:id/batches', [AddIngredientBatchController, 'execute'])
      .as('inventory.batches.store')
    router
      .patch('inventory/:id/batches/:batchId', [UpdateIngredientBatchController, 'execute'])
      .as('inventory.batches.update')
    router
      .delete('inventory/:id/batches/:batchId', [RemoveIngredientBatchController, 'execute'])
      .as('inventory.batches.destroy')
  })
  .use([middleware.auth(), middleware.verified()])
