/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  inventory: {
    index: typeof routes['inventory.index']
    store: typeof routes['inventory.store']
    markdown: typeof routes['inventory.markdown']
    update: typeof routes['inventory.update']
    adjust: typeof routes['inventory.adjust']
    destroy: typeof routes['inventory.destroy']
  }
  recipes: {
    index: typeof routes['recipes.index']
    show: typeof routes['recipes.show']
    destroy: typeof routes['recipes.destroy']
  }
  mcp: typeof routes['mcp'] & {
    protectedResource: typeof routes['mcp.protected_resource'] & {
      root: typeof routes['mcp.protected_resource.root']
    }
  }
  oauth: {
    authorization: {
      show: typeof routes['oauth.authorization.show']
      approve: typeof routes['oauth.authorization.approve']
      deny: typeof routes['oauth.authorization.deny']
    }
  }
  up: typeof routes['up']
  health: typeof routes['health']
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
    oauthConnections: {
      destroy: typeof routes['account.oauth_connections.destroy']
    }
  }
  cooking: {
    start: typeof routes['cooking.start']
    join: typeof routes['cooking.join'] & {
      store: typeof routes['cooking.join.store']
    }
    show: typeof routes['cooking.show']
    state: typeof routes['cooking.state'] & {
      update: typeof routes['cooking.state.update']
    }
  }
}
