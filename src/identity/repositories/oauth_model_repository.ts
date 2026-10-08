import { inject } from '@adonisjs/core'
import { sql } from 'kysely'
import { hashSecureToken } from '#identity/domain/secure_token'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { UserIdentifier } from '#identity/domain/user_identifier'
import type { Json } from '#types/db'
import type { AdapterPayload } from 'oidc-provider'

/**
 * Grants and clients never act as credentials on their own, and a
 * session id is useless without the signed cookie that carries it (its
 * uid lookup also needs the clear id back). Every other identifier is a
 * bearer value, a token or a code, stored hashed.
 */
const PLAIN_KINDS = new Set(['Grant', 'Client', 'Session'])

function storedId(kind: string, id: string) {
  return PLAIN_KINDS.has(kind) ? id : hashSecureToken(id)
}

/**
 * The payload of a hashed artifact must not carry its clear id either.
 */
function storedPayload(kind: string, payload: AdapterPayload) {
  if (PLAIN_KINDS.has(kind)) {
    return payload
  }

  const { jti: _clearId, ...stored } = payload
  return stored
}

/**
 * Storage of the OAuth authorization server, shaped after the adapter
 * contract of oidc-provider: artifacts are addressed by kind and id,
 * expire on their own, and the tokens of a grant go with it.
 */
@inject()
export class OAuthModelRepository {
  constructor(private readonly transactions: TransactionManager) {}

  async upsert(kind: string, id: string, payload: AdapterPayload, expiresIn?: number) {
    const database = this.transactions.currentDatabase()
    const grantId = kind === 'Grant' ? id : (payload.grantId ?? null)
    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null
    const row = {
      payload: sql<Json>`${storedPayload(kind, payload)}::jsonb`,
      grant_id: grantId,
      uid: payload.uid ?? null,
      account_id: payload.accountId ?? null,
      expires_at: expiresAt,
    }

    await database
      .insertInto('oauth_models')
      .values({ kind, id: storedId(kind, id), ...row })
      .onConflict((conflict) => conflict.columns(['kind', 'id']).doUpdateSet(row))
      .execute()

    await database.deleteFrom('oauth_models').where('expires_at', '<', new Date()).execute()
  }

  async find(kind: string, id: string) {
    const record = await this.transactions
      .currentDatabase()
      .selectFrom('oauth_models')
      .select(['payload', 'consumed_at'])
      .where('kind', '=', kind)
      .where('id', '=', storedId(kind, id))
      .where((eb) => eb.or([eb('expires_at', 'is', null), eb('expires_at', '>', new Date())]))
      .executeTakeFirst()

    return record ? this.#hydrate(id, record) : undefined
  }

  /**
   * Only sessions are looked up by uid, and their id is kept clear.
   */
  async findByUid(kind: string, uid: string) {
    const record = await this.transactions
      .currentDatabase()
      .selectFrom('oauth_models')
      .select(['id', 'payload', 'consumed_at'])
      .where('kind', '=', kind)
      .where('uid', '=', uid)
      .where((eb) => eb.or([eb('expires_at', 'is', null), eb('expires_at', '>', new Date())]))
      .executeTakeFirst()

    return record ? this.#hydrate(record.id, record) : undefined
  }

  async consume(kind: string, id: string) {
    await this.transactions
      .currentDatabase()
      .updateTable('oauth_models')
      .set({ consumed_at: new Date() })
      .where('kind', '=', kind)
      .where('id', '=', storedId(kind, id))
      .execute()
  }

  async destroy(kind: string, id: string) {
    await this.transactions
      .currentDatabase()
      .deleteFrom('oauth_models')
      .where('kind', '=', kind)
      .where('id', '=', storedId(kind, id))
      .execute()
  }

  /**
   * Removes the codes and tokens issued under a grant, not the grant.
   */
  async revokeByGrantId(grantId: string) {
    await this.transactions
      .currentDatabase()
      .deleteFrom('oauth_models')
      .where('grant_id', '=', grantId)
      .where('kind', '<>', 'Grant')
      .execute()
  }

  async nameGrant(grantId: string, clientName: string) {
    await this.transactions
      .currentDatabase()
      .updateTable('oauth_models')
      .set({ client_name: clientName })
      .where('kind', '=', 'Grant')
      .where('id', '=', grantId)
      .execute()
  }

  async touchGrant(grantId: string, at: Date) {
    await this.transactions
      .currentDatabase()
      .updateTable('oauth_models')
      .set({ last_used_at: at })
      .where('kind', '=', 'Grant')
      .where('id', '=', grantId)
      .execute()
  }

  /**
   * Deletes a grant of the user with everything issued under it.
   * Returns whether it existed: a foreign or unknown grant is a no-op
   * the caller reports.
   */
  async deleteGrant(userId: UserIdentifier, grantId: string) {
    const result = await this.transactions
      .currentDatabase()
      .deleteFrom('oauth_models')
      .where('account_id', '=', userId.toString())
      .where('grant_id', '=', grantId)
      .executeTakeFirst()

    return Number(result.numDeletedRows) > 0
  }

  #hydrate(id: string, record: { payload: unknown; consumed_at: Date | null }): AdapterPayload {
    // SAFETY: The column only ever receives payloads written by upsert.
    const payload: AdapterPayload = { ...(record.payload as AdapterPayload), jti: id }

    if (record.consumed_at) {
      payload.consumed = Math.floor(record.consumed_at.getTime() / 1000)
    }

    return payload
  }
}
