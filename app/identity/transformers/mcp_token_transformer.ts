import { BaseTransformer } from '@adonisjs/core/transformers'
import type { McpTokenView } from '#identity/queries/mcp_tokens_query'

export default class McpTokenTransformer extends BaseTransformer<McpTokenView> {
  toObject() {
    return this.pick(this.resource, ['id', 'name', 'prefix', 'createdAt', 'lastUsedAt'])
  }
}
