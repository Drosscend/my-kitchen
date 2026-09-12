import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const RecipeLibraryController = () => import('#app/recipes/controllers/recipe_library_controller')
const RecipeController = () => import('#app/recipes/controllers/recipe_controller')
const DeleteRecipeController = () => import('#app/recipes/controllers/delete_recipe_controller')

router
  .group(() => {
    router.get('recipes', [RecipeLibraryController, 'render']).as('recipes.index')
    router.get('recipes/:id', [RecipeController, 'render']).as('recipes.show')
    router.delete('recipes/:id', [DeleteRecipeController, 'execute']).as('recipes.destroy')
  })
  .use([middleware.auth(), middleware.verified()])
