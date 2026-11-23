import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'
import { UpdateExpiryWarnings } from '#inventory/actions/update_expiry_warnings'
import { INGREDIENT_CATEGORY_VALUES } from '#inventory/domain/catalog'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class UpdateExpiryWarningsController {
  static readonly validator = vine.create({
    warnings: vine.array(
      vine.object({
        category: vine.enum(INGREDIENT_CATEGORY_VALUES),
        perishable: vine.number().withoutDecimals().min(0).max(365).nullable(),
        shelfStable: vine.number().withoutDecimals().min(0).max(365).nullable(),
      })
    ),
  })

  constructor(private readonly updateExpiryWarnings: UpdateExpiryWarnings) {}

  async execute({ request, response, auth, session }: HttpContext) {
    const { warnings } = await request.validateUsing(UpdateExpiryWarningsController.validator)
    await this.updateExpiryWarnings.execute({
      userId: auth.getUserOrFail().getIdentifier(),
      warnings,
    })

    session.flash('success', "Délais d'alerte enregistrés")
    return response.redirect().toRoute('account.show')
  }
}
