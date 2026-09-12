import { defineConfig, stores } from '@adonisjs/limiter'
import type { InferLimiters } from '@adonisjs/limiter/types'

/**
 * In-memory store: counters are per-process, which is enough as long
 * as the app runs as a single container.
 */
const limiterConfig = defineConfig({
  default: 'memory',

  stores: {
    memory: stores.memory({}),
  },
})

export default limiterConfig

declare module '@adonisjs/limiter/types' {
  export interface LimitersList extends InferLimiters<typeof limiterConfig> {}
}
