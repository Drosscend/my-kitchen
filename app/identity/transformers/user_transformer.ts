import { BaseTransformer } from '@adonisjs/core/transformers'
import type { User } from '#identity/domain/user'

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    return this.pick(this.resource, ['email'])
  }
}
