import app from '@adonisjs/core/services/app'
import { test } from '@japa/runner'
import { ok } from '#core/result'
import { RegisterUser, type RegisterUserParams } from '#identity/actions/register_user'
import { makeUser } from '#tests/helpers/users'

test.group('Create user command', (group) => {
  group.each.teardown(() => app.container.restore(RegisterUser))

  test('delegates user creation to RegisterUser', async ({ assert }) => {
    let receivedParams: RegisterUserParams | undefined
    const user = makeUser()
    // SAFETY: The command only calls `execute`; this focused double implements that contract.
    const registerUser = {
      execute(params: RegisterUserParams) {
        receivedParams = params
        return Promise.resolve(ok(user))
      },
    } as RegisterUser

    app.container.swap(RegisterUser, () => registerUser)
    const ace = await app.container.make('ace')
    const command = await ace.exec('create:user', [
      '--name=  Ada Lovelace  ',
      '--email=  ADA@example.com  ',
      '--password=a-secure-password',
    ])

    assert.equal(command.exitCode, 0)
    assert.deepEqual(receivedParams, {
      name: '  Ada Lovelace  ',
      email: '  ADA@example.com  ',
      password: 'a-secure-password',
      emailVerified: true,
    })
  })

  test('asks only for values not provided as flags', async ({ assert }) => {
    let receivedParams: RegisterUserParams | undefined
    const user = makeUser()
    // SAFETY: The command only calls `execute`; this focused double implements that contract.
    const registerUser = {
      execute(params: RegisterUserParams) {
        receivedParams = params
        return Promise.resolve(ok(user))
      },
    } as RegisterUser

    app.container.swap(RegisterUser, () => registerUser)
    const ace = await app.container.make('ace')
    ace.prompt.trap('What is the user email?').replyWith('ada@example.com')
    ace.prompt.trap('What is the user password?').replyWith('a-secure-password')
    const command = await ace.exec('create:user', ['--name=Ada Lovelace'])

    assert.equal(command.exitCode, 0)
    assert.deepEqual(receivedParams, {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'a-secure-password',
      emailVerified: true,
    })
  })
})
