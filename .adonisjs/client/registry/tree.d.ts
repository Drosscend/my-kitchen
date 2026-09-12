/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  newAccount: {
    create: typeof routes['new_account.create']
    store: typeof routes['new_account.store']
  }
  session: {
    create: typeof routes['session.create']
    store: typeof routes['session.store']
    destroy: typeof routes['session.destroy']
  }
  password: {
    forgot: typeof routes['password.forgot']
    email: typeof routes['password.email']
    reset: typeof routes['password.reset']
    update: typeof routes['password.update']
  }
  verification: {
    verify: typeof routes['verification.verify']
    notice: typeof routes['verification.notice']
    resend: typeof routes['verification.resend']
  }
  account: {
    show: typeof routes['account.show']
    profile: {
      update: typeof routes['account.profile.update']
    }
    email: {
      update: typeof routes['account.email.update']
    }
    password: {
      update: typeof routes['account.password.update']
    }
    destroy: typeof routes['account.destroy']
  }
  home: typeof routes['home']
}
