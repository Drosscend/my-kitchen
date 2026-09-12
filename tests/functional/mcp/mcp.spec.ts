import app from '@adonisjs/core/services/app'
import { test } from '@japa/runner'
import { CreateMcpToken } from '#identity/actions/create_mcp_token'
import { BREAD, importRecipe, storedRecipes } from '#tests/helpers/recipes'
import { resetState } from '#tests/helpers/state'
import { createUser } from '#tests/helpers/users'
import type { User } from '#identity/domain/user'
import type { ApiClient } from '@japa/api-client'

async function issueToken(user: User) {
  const createMcpToken = await app.container.make(CreateMcpToken)
  const result = await createMcpToken.execute({ userId: user.getIdentifier(), name: 'Tests' })

  if (!result.ok) {
    throw new Error('Cannot issue the test token')
  }

  return result.value
}

interface ToolCall {
  name: string
  arguments: object
}

type RpcParams = ToolCall | Record<string, never>

interface RpcResult {
  tools?: { name: string }[]
  isError?: boolean
  content?: { text: string }[]
  structuredContent?: object
}

interface RpcResponse {
  text: () => string
}

/**
 * Speaks the 2025 flavor of the protocol, served statelessly: one
 * JSON-RPC request per POST, no session to open first.
 */
function rpc(client: ApiClient, token: string | null, method: string, params: RpcParams) {
  const request = client
    .post('/mcp')
    .header('accept', 'application/json, text/event-stream')
    .header('mcp-protocol-version', '2025-11-25')
    .json({ jsonrpc: '2.0', id: 1, method, params })

  return token ? request.bearerToken(token) : request
}

/**
 * The stateless legacy path answers over SSE: the result is the JSON of
 * the single data line.
 */
function rpcResult(response: RpcResponse): RpcResult {
  const data = response
    .text()
    .split('\n')
    .find((line) => line.startsWith('data: '))

  if (!data) {
    throw new Error(`No JSON-RPC result in ${response.text().slice(0, 200)}`)
  }

  const message: { result?: RpcResult; error?: { message: string } } = JSON.parse(data.slice(6))

  if (!message.result) {
    throw new Error(`JSON-RPC error: ${message.error?.message}`)
  }

  return message.result
}

function structured<TOutput extends object>(response: RpcResponse) {
  // SAFETY: Each test reads the output its tool declares through outputSchema.
  return rpcResult(response).structuredContent as TOutput
}

test.group('MCP', (group) => {
  group.each.setup(() => resetState())

  test('refuses requests without a valid personal token', async ({ client }) => {
    const missing = await rpc(client, null, 'tools/list', {})
    const wrong = await rpc(client, 'mk_not-a-real-token-value', 'tools/list', {})

    missing.assertStatus(401)
    missing.assertHeader('www-authenticate')
    wrong.assertStatus(401)
  })

  test('lists the tools and reads the pantry of the token owner only', async ({
    client,
    assert,
  }) => {
    const ada = await createUser('ada@example.com')
    const bob = await createUser('bob@example.com')
    const token = await issueToken(ada)
    await client.post('/inventory').loginAs(bob).withCsrfToken().form({
      name: 'Secret de Bob',
      quantity: 1,
      unit: 'piece',
      category: 'other',
      state: 'fresh',
    })

    const tools = await rpc(client, token, 'tools/list', {})
    const added = await rpc(client, token, 'tools/call', {
      name: 'add_ingredient',
      arguments: { name: 'Farine', quantity: 500, unit: 'g', category: 'starches' },
    })
    const listed = await rpc(client, token, 'tools/call', {
      name: 'list_ingredients',
      arguments: {},
    })

    tools.assertStatus(200)
    assert.sameMembers(rpcResult(tools).tools?.map((tool) => tool.name) ?? [], [
      'list_ingredients',
      'add_ingredient',
      'update_ingredient',
      'consume_ingredients',
      'remove_ingredient',
      'list_recipes',
      'get_recipe',
      'add_recipe',
      'update_recipe',
      'delete_recipe',
    ])
    assert.containsSubset(structured(added), { ingredient: { name: 'Farine', state: 'fresh' } })
    assert.deepEqual(
      structured<{ ingredients: { name: string }[] }>(listed).ingredients.map((item) => item.name),
      ['Farine']
    )
  })

  test('consumes ingredients and reports business errors as tool errors', async ({
    client,
    assert,
  }) => {
    const ada = await createUser('ada@example.com')
    const token = await issueToken(ada)
    const added = await rpc(client, token, 'tools/call', {
      name: 'add_ingredient',
      arguments: { name: 'Farine', quantity: 500, unit: 'g', category: 'starches' },
    })
    const id = structured<{ ingredient: { id: string } }>(added).ingredient.id

    const consumed = await rpc(client, token, 'tools/call', {
      name: 'consume_ingredients',
      arguments: { items: [{ id, quantity: 800 }] },
    })
    const unknown = await rpc(client, token, 'tools/call', {
      name: 'remove_ingredient',
      arguments: { id: 'nope' },
    })

    assert.containsSubset(structured(consumed), { ingredients: [{ id, quantity: 0 }] })
    assert.isTrue(rpcResult(unknown).isError)
    assert.include(rpcResult(unknown).content?.[0]?.text, 'Ingrédient introuvable')
  })

  test('adds, reads, replaces and deletes recipes as documents', async ({ client, assert }) => {
    const ada = await createUser('ada@example.com')
    const token = await issueToken(ada)

    const added = await rpc(client, token, 'tools/call', {
      name: 'add_recipe',
      arguments: { recipe: BREAD },
    })
    const id = structured<{ recipe: { id: string } }>(added).recipe.id
    const replaced = await rpc(client, token, 'tools/call', {
      name: 'update_recipe',
      arguments: { id, recipe: { ...BREAD, title: 'Pain complet' } },
    })
    const read = await rpc(client, token, 'tools/call', { name: 'get_recipe', arguments: { id } })
    const deleted = await rpc(client, token, 'tools/call', {
      name: 'delete_recipe',
      arguments: { id },
    })

    assert.containsSubset(structured(added), {
      recipe: { title: 'Pain maison', base_servings: 2, ingredients: [{ id: 'flour' }] },
    })
    assert.containsSubset(structured(replaced), { recipe: { id, title: 'Pain complet' } })
    assert.containsSubset(structured(read), {
      recipe: {
        title: 'Pain complet',
        steps: [{ id: 'mix' }, { id: 'rest', timer_seconds: 3600 }],
      },
    })
    assert.deepEqual(structured(deleted), { deleted: true })
    assert.lengthOf(await storedRecipes(ada), 0)
  })

  test('only sees recipes of the token owner', async ({ client, assert }) => {
    const ada = await createUser('ada@example.com')
    const bob = await createUser('bob@example.com')
    await importRecipe(client, bob, BREAD)
    const token = await issueToken(ada)

    const listed = await rpc(client, token, 'tools/call', { name: 'list_recipes', arguments: {} })

    assert.deepEqual(structured(listed), { recipes: [] })
  })
})
