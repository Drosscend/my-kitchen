import { createTuyau } from '@tuyau/core/client'
import { registry } from '@generated/registry'

export const client = createTuyau({
  baseUrl: '/',
  registry,
})
