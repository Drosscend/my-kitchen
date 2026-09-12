import type { ApiResponse } from '@japa/api-client'

/**
 * Requests are made without following redirects, so the target is read
 * from the Location header rather than from the followed chain.
 */
export function assertRedirectedTo(response: ApiResponse, path: string) {
  response.assertStatus(302)
  response.assertHeader('location', path)
}
