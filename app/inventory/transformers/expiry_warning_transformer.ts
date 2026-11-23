import { BaseTransformer } from '@adonisjs/core/transformers'
import type { ExpiryWarningView } from '#inventory/queries/expiry_warnings_query'

export default class ExpiryWarningTransformer extends BaseTransformer<ExpiryWarningView> {
  toObject() {
    return this.pick(this.resource, ['category', 'categoryLabel', 'custom', 'defaults'])
  }
}
