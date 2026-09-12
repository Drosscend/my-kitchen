import { inject } from '@adonisjs/core'
import { normalizeName } from '#identity/domain/user'
import { UserRepository } from '#identity/repositories/user_repository'
import type { User } from '#identity/domain/user'

export interface UpdateProfileParams {
  user: User
  name: string | null
}

@inject()
export class UpdateProfile {
  constructor(private readonly users: UserRepository) {}

  async execute(params: UpdateProfileParams): Promise<void> {
    await this.users.updateName(params.user.getIdentifier(), normalizeName(params.name))
  }
}
