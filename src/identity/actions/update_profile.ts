import { inject } from '@adonisjs/core'
import { UserRepository } from '#identity/repositories/user_repository'
import type { User } from '#identity/domain/user'

export interface UpdateProfileParams {
  user: User
  name: string | null
}

@inject()
export class UpdateProfile {
  constructor(private readonly users: UserRepository) {}

  async execute(params: UpdateProfileParams): Promise<User | null> {
    return this.users.updateName(params.user.getIdentifier(), params.name?.trim() || null)
  }
}
