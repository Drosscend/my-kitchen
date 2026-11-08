import type { HttpContext } from '@adonisjs/core/http'

export default class NewRecipeController {
  render({ inertia }: HttpContext) {
    return inertia.render('recipes/create', {})
  }
}
