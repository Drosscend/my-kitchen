import { BaseTransformer } from '@adonisjs/core/transformers'
import type { PushDevice } from '#notifications/queries/push_devices_query'

export default class PushDeviceTransformer extends BaseTransformer<PushDevice> {
  toObject() {
    return this.pick(this.resource, ['id', 'label', 'endpoint', 'createdAt'])
  }
}
