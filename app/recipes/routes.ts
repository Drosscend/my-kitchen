import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const RecipeLibraryController = () => import('#app/recipes/controllers/recipe_library_controller')
const RecipeController = () => import('#app/recipes/controllers/recipe_controller')
const NewRecipeController = () => import('#app/recipes/controllers/new_recipe_controller')
const AddRecipeController = () => import('#app/recipes/controllers/add_recipe_controller')
const EditRecipeController = () => import('#app/recipes/controllers/edit_recipe_controller')
const UpdateRecipeController = () => import('#app/recipes/controllers/update_recipe_controller')
const DeleteRecipeController = () => import('#app/recipes/controllers/delete_recipe_controller')

router
  .group(() => {
    router.get('recipes', [RecipeLibraryController, 'render']).as('recipes.index')
    router.get('recipes/new', [NewRecipeController, 'render']).as('recipes.create')
    router.post('recipes', [AddRecipeController, 'execute']).as('recipes.store')
    router.get('recipes/:id', [RecipeController, 'render']).as('recipes.show')
    router.get('recipes/:id/edit', [EditRecipeController, 'render']).as('recipes.edit')
    router.put('recipes/:id', [UpdateRecipeController, 'execute']).as('recipes.update')
    router.delete('recipes/:id', [DeleteRecipeController, 'execute']).as('recipes.destroy')
  })
  .use([middleware.auth(), middleware.verified()])
