import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const RecipeLibraryController = () => import('#app/recipes/controllers/recipe_library_controller')
const RecipeController = () => import('#app/recipes/controllers/recipe_controller')
const ImportRecipesController = () => import('#app/recipes/controllers/import_recipes_controller')
const DeleteRecipeController = () => import('#app/recipes/controllers/delete_recipe_controller')
const StartCookingSessionController = () =>
  import('#app/recipes/controllers/start_cooking_session_controller')

router
  .group(() => {
    router.get('recipes', [RecipeLibraryController, 'render']).as('recipes.index')
    router.post('recipes/import', [ImportRecipesController, 'execute']).as('recipes.import')
    router.get('recipes/:id', [RecipeController, 'render']).as('recipes.show')
    router.delete('recipes/:id', [DeleteRecipeController, 'execute']).as('recipes.destroy')
    router.post('recipes/:id/cook', [StartCookingSessionController, 'execute']).as('recipes.cook')
  })
  .use([middleware.auth(), middleware.verified()])
