import { test } from '@japa/runner'
import { resolvesToPublicAddresses } from '#app/oauth/public_host'

test.group('Client metadata document hosts', () => {
  test('refuses hosts inside the private network', async ({ assert }) => {
    for (const host of [
      'localhost',
      '127.0.0.1',
      '10.0.0.4',
      '172.18.0.2',
      '192.168.1.1',
      '[::1]',
    ]) {
      assert.isFalse(await resolvesToPublicAddresses(host), host)
    }
  })

  test('accepts a public address', async ({ assert }) => {
    assert.isTrue(await resolvesToPublicAddresses('160.79.104.10'))
  })
})
