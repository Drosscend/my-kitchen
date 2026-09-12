import { inject } from '@adonisjs/core'
import postgres from 'postgres'
import { err, ok, type Result } from '#core/result'
import { EmailAddress } from '#identity/domain/email_address'
import { User } from '#identity/domain/user'
import { UserIdentifier } from '#identity/domain/user_identifier'
import { TransactionManager } from '#shared/services/transaction_manager'
import type { Users } from '#types/db'
import type { Selectable } from 'kysely'

const userColumns = [
  'id',
  'name',
  'email',
  'password',
  'email_verified_at',
  'created_at',
  'updated_at',
] as const
type UserRecord = Pick<Selectable<Users>, (typeof userColumns)[number]>

interface CreateUserPayload {
  id: UserIdentifier
  name: string | null
  email: EmailAddress
  passwordHash: string
  emailVerifiedAt: Date | null
}

export interface EmailAlreadyTakenError {
  type: 'email_already_taken'
}

@inject()
export class UserRepository {
  constructor(private readonly transactions: TransactionManager) {}

  async createUser(payload: CreateUserPayload): Promise<Result<User, EmailAlreadyTakenError>> {
    try {
      const record = await this.transactions
        .currentDatabase()
        .insertInto('users')
        .values({
          id: payload.id.toString(),
          name: payload.name,
          email: payload.email.toString(),
          password: payload.passwordHash,
          email_verified_at: payload.emailVerifiedAt,
          updated_at: null,
        })
        .returning(userColumns)
        .executeTakeFirstOrThrow()

      return ok(this.#toDomain(record))
    } catch (error) {
      if (
        error instanceof postgres.PostgresError &&
        error.code === '23505' &&
        error.constraint_name === 'users_email_unique'
      ) {
        return err({ type: 'email_already_taken' })
      }
      throw error
    }
  }

  async findUserByEmail(email: EmailAddress) {
    const record = await this.transactions
      .currentDatabase()
      .selectFrom('users')
      .select(userColumns)
      .where('email', '=', email.toString())
      .executeTakeFirst()

    return record ? this.#toDomain(record) : null
  }

  async findUserById(id: string) {
    const record = await this.transactions
      .currentDatabase()
      .selectFrom('users')
      .select(userColumns)
      .where('id', '=', id)
      .executeTakeFirst()

    return record ? this.#toDomain(record) : null
  }

  /**
   * Also stores the verified address, so confirming a link issued for a
   * new address is what makes the change effective.
   */
  async markEmailVerified(
    id: UserIdentifier,
    email: EmailAddress,
    verifiedAt: Date
  ): Promise<Result<User | null, EmailAlreadyTakenError>> {
    try {
      const record = await this.transactions
        .currentDatabase()
        .updateTable('users')
        .set({ email: email.toString(), email_verified_at: verifiedAt, updated_at: verifiedAt })
        .where('id', '=', id.toString())
        .returning(userColumns)
        .executeTakeFirst()

      return ok(record ? this.#toDomain(record) : null)
    } catch (error) {
      if (
        error instanceof postgres.PostgresError &&
        error.code === '23505' &&
        error.constraint_name === 'users_email_unique'
      ) {
        return err({ type: 'email_already_taken' })
      }
      throw error
    }
  }

  async updateName(id: UserIdentifier, name: string | null) {
    const record = await this.transactions
      .currentDatabase()
      .updateTable('users')
      .set({ name, updated_at: new Date() })
      .where('id', '=', id.toString())
      .returning(userColumns)
      .executeTakeFirst()

    return record ? this.#toDomain(record) : null
  }

  async updatePassword(id: UserIdentifier, passwordHash: string) {
    const record = await this.transactions
      .currentDatabase()
      .updateTable('users')
      .set({ password: passwordHash, updated_at: new Date() })
      .where('id', '=', id.toString())
      .returning(userColumns)
      .executeTakeFirst()

    return record ? this.#toDomain(record) : null
  }

  async deleteUser(id: UserIdentifier) {
    await this.transactions
      .currentDatabase()
      .deleteFrom('users')
      .where('id', '=', id.toString())
      .execute()
  }

  #toDomain(record: UserRecord) {
    const email = EmailAddress.create(record.email)

    if (!email.ok) {
      throw new Error(`Invalid email address persisted for user ${record.id}`)
    }

    return User.create({
      id: UserIdentifier.fromString(record.id),
      name: record.name,
      email: email.value,
      passwordHash: record.password,
      emailVerifiedAt: record.email_verified_at,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    })
  }
}
