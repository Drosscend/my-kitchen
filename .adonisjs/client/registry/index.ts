/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

export type { Route, Path } from './schema.d.ts'

const placeholder: any = {}

const routes = {
  'mcp': {
    methods: ["POST","GET","DELETE"],
    pattern: '/mcp',
    tokens: [[0,"mcp"]],
    types: placeholder as Registry['mcp']['types'],
  },
  'mcp.protected_resource': {
    methods: ["GET","HEAD"],
    pattern: '/.well-known/oauth-protected-resource/mcp',
    tokens: [[0,".well-known"],[0,"oauth-protected-resource"],[0,"mcp"]],
    types: placeholder as Registry['mcp.protected_resource']['types'],
  },
  'mcp.protected_resource.root': {
    methods: ["GET","HEAD"],
    pattern: '/.well-known/oauth-protected-resource',
    tokens: [[0,".well-known"],[0,"oauth-protected-resource"]],
    types: placeholder as Registry['mcp.protected_resource.root']['types'],
  },
  'up': {
    methods: ["GET","HEAD"],
    pattern: '/up',
    tokens: [[0,"up"]],
    types: placeholder as Registry['up']['types'],
  },
  'health': {
    methods: ["GET","HEAD"],
    pattern: '/health',
    tokens: [[0,"health"]],
    types: placeholder as Registry['health']['types'],
  },
  'inventory.index': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [[0,"/"]],
    types: placeholder as Registry['inventory.index']['types'],
  },
  'inventory.store': {
    methods: ["POST"],
    pattern: '/inventory',
    tokens: [[0,"inventory"]],
    types: placeholder as Registry['inventory.store']['types'],
  },
  'inventory.markdown': {
    methods: ["GET","HEAD"],
    pattern: '/inventory/markdown',
    tokens: [[0,"inventory"],[0,"markdown"]],
    types: placeholder as Registry['inventory.markdown']['types'],
  },
  'inventory.update': {
    methods: ["PATCH"],
    pattern: '/inventory/:id',
    tokens: [[0,"inventory"],[1,"id"]],
    types: placeholder as Registry['inventory.update']['types'],
  },
  'inventory.adjust': {
    methods: ["POST"],
    pattern: '/inventory/:id/adjust',
    tokens: [[0,"inventory"],[1,"id"],[0,"adjust"]],
    types: placeholder as Registry['inventory.adjust']['types'],
  },
  'inventory.destroy': {
    methods: ["DELETE"],
    pattern: '/inventory/:id',
    tokens: [[0,"inventory"],[1,"id"]],
    types: placeholder as Registry['inventory.destroy']['types'],
  },
  'inventory.batches.store': {
    methods: ["POST"],
    pattern: '/inventory/:id/batches',
    tokens: [[0,"inventory"],[1,"id"],[0,"batches"]],
    types: placeholder as Registry['inventory.batches.store']['types'],
  },
  'inventory.batches.update': {
    methods: ["PATCH"],
    pattern: '/inventory/:id/batches/:batchId',
    tokens: [[0,"inventory"],[1,"id"],[0,"batches"],[1,"batchId"]],
    types: placeholder as Registry['inventory.batches.update']['types'],
  },
  'inventory.batches.destroy': {
    methods: ["DELETE"],
    pattern: '/inventory/:id/batches/:batchId',
    tokens: [[0,"inventory"],[1,"id"],[0,"batches"],[1,"batchId"]],
    types: placeholder as Registry['inventory.batches.destroy']['types'],
  },
  'recipes.index': {
    methods: ["GET","HEAD"],
    pattern: '/recipes',
    tokens: [[0,"recipes"]],
    types: placeholder as Registry['recipes.index']['types'],
  },
  'recipes.show': {
    methods: ["GET","HEAD"],
    pattern: '/recipes/:id',
    tokens: [[0,"recipes"],[1,"id"]],
    types: placeholder as Registry['recipes.show']['types'],
  },
  'recipes.destroy': {
    methods: ["DELETE"],
    pattern: '/recipes/:id',
    tokens: [[0,"recipes"],[1,"id"]],
    types: placeholder as Registry['recipes.destroy']['types'],
  },
  'oauth.authorization.show': {
    methods: ["GET","HEAD"],
    pattern: '/oauth/interaction/:uid',
    tokens: [[0,"oauth"],[0,"interaction"],[1,"uid"]],
    types: placeholder as Registry['oauth.authorization.show']['types'],
  },
  'oauth.authorization.approve': {
    methods: ["POST"],
    pattern: '/oauth/interaction/:uid',
    tokens: [[0,"oauth"],[0,"interaction"],[1,"uid"]],
    types: placeholder as Registry['oauth.authorization.approve']['types'],
  },
  'oauth.authorization.deny': {
    methods: ["POST"],
    pattern: '/oauth/interaction/:uid/deny',
    tokens: [[0,"oauth"],[0,"interaction"],[1,"uid"],[0,"deny"]],
    types: placeholder as Registry['oauth.authorization.deny']['types'],
  },
  'new_account.create': {
    methods: ["GET","HEAD"],
    pattern: '/signup',
    tokens: [[0,"signup"]],
    types: placeholder as Registry['new_account.create']['types'],
  },
  'new_account.store': {
    methods: ["POST"],
    pattern: '/signup',
    tokens: [[0,"signup"]],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'session.create': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [[0,"login"]],
    types: placeholder as Registry['session.create']['types'],
  },
  'session.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [[0,"login"]],
    types: placeholder as Registry['session.store']['types'],
  },
  'password.forgot': {
    methods: ["GET","HEAD"],
    pattern: '/forgot-password',
    tokens: [[0,"forgot-password"]],
    types: placeholder as Registry['password.forgot']['types'],
  },
  'password.email': {
    methods: ["POST"],
    pattern: '/forgot-password',
    tokens: [[0,"forgot-password"]],
    types: placeholder as Registry['password.email']['types'],
  },
  'password.reset': {
    methods: ["GET","HEAD"],
    pattern: '/reset-password/:token',
    tokens: [[0,"reset-password"],[1,"token"]],
    types: placeholder as Registry['password.reset']['types'],
  },
  'password.update': {
    methods: ["POST"],
    pattern: '/reset-password',
    tokens: [[0,"reset-password"]],
    types: placeholder as Registry['password.update']['types'],
  },
  'verification.verify': {
    methods: ["GET","HEAD"],
    pattern: '/verify-email/:token',
    tokens: [[0,"verify-email"],[1,"token"]],
    types: placeholder as Registry['verification.verify']['types'],
  },
  'verification.notice': {
    methods: ["GET","HEAD"],
    pattern: '/verify-email',
    tokens: [[0,"verify-email"]],
    types: placeholder as Registry['verification.notice']['types'],
  },
  'verification.resend': {
    methods: ["POST"],
    pattern: '/verify-email/resend',
    tokens: [[0,"verify-email"],[0,"resend"]],
    types: placeholder as Registry['verification.resend']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [[0,"logout"]],
    types: placeholder as Registry['session.destroy']['types'],
  },
  'account.show': {
    methods: ["GET","HEAD"],
    pattern: '/account',
    tokens: [[0,"account"]],
    types: placeholder as Registry['account.show']['types'],
  },
  'account.profile.update': {
    methods: ["POST"],
    pattern: '/account/profile',
    tokens: [[0,"account"],[0,"profile"]],
    types: placeholder as Registry['account.profile.update']['types'],
  },
  'account.email.update': {
    methods: ["POST"],
    pattern: '/account/email',
    tokens: [[0,"account"],[0,"email"]],
    types: placeholder as Registry['account.email.update']['types'],
  },
  'account.password.update': {
    methods: ["POST"],
    pattern: '/account/password',
    tokens: [[0,"account"],[0,"password"]],
    types: placeholder as Registry['account.password.update']['types'],
  },
  'account.destroy': {
    methods: ["DELETE"],
    pattern: '/account',
    tokens: [[0,"account"]],
    types: placeholder as Registry['account.destroy']['types'],
  },
  'account.oauth_connections.destroy': {
    methods: ["DELETE"],
    pattern: '/account/oauth-connections/:id',
    tokens: [[0,"account"],[0,"oauth-connections"],[1,"id"]],
    types: placeholder as Registry['account.oauth_connections.destroy']['types'],
  },
  'cooking.start': {
    methods: ["POST"],
    pattern: '/recipes/:id/cook',
    tokens: [[0,"recipes"],[1,"id"],[0,"cook"]],
    types: placeholder as Registry['cooking.start']['types'],
  },
  'cooking.join': {
    methods: ["GET","HEAD"],
    pattern: '/cook/join',
    tokens: [[0,"cook"],[0,"join"]],
    types: placeholder as Registry['cooking.join']['types'],
  },
  'cooking.join.store': {
    methods: ["POST"],
    pattern: '/cook/join',
    tokens: [[0,"cook"],[0,"join"]],
    types: placeholder as Registry['cooking.join.store']['types'],
  },
  'cooking.show': {
    methods: ["GET","HEAD"],
    pattern: '/cook/:code',
    tokens: [[0,"cook"],[1,"code"]],
    types: placeholder as Registry['cooking.show']['types'],
  },
  'cooking.state': {
    methods: ["GET","HEAD"],
    pattern: '/cook/:code/state',
    tokens: [[0,"cook"],[1,"code"],[0,"state"]],
    types: placeholder as Registry['cooking.state']['types'],
  },
  'cooking.state.update': {
    methods: ["PATCH"],
    pattern: '/cook/:code/state',
    tokens: [[0,"cook"],[1,"code"],[0,"state"]],
    types: placeholder as Registry['cooking.state.update']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
