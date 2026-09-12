import { test } from '@japa/runner'
import { UserIdentifier } from '#identity/domain/user_identifier'
import { makeUser } from '#tests/helpers/users'

test.group('User', () => {
  test('compares entities by their typed identifier', ({ assert }) => {
    const id = UserIdentifier.generate()

    assert.isTrue(makeUser({ id }).equals(makeUser({ id, email: 'updated@example.com' })))
    assert.isFalse(makeUser({ id }).equals(makeUser()))
  })
})
