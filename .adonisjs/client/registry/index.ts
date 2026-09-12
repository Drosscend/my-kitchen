/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'mcp': {
    methods: ["POST","GET","DELETE"],
    pattern: '/mcp',
    tokens: [{"old":"/mcp","type":0,"val":"mcp","end":""}],
    types: placeholder as Registry['mcp']['types'],
  },
  'up': {
    methods: ["GET","HEAD"],
    pattern: '/up',
    tokens: [{"old":"/up","type":0,"val":"up","end":""}],
    types: placeholder as Registry['up']['types'],
  },
  'health': {
    methods: ["GET","HEAD"],
    pattern: '/health',
    tokens: [{"old":"/health","type":0,"val":"health","end":""}],
    types: placeholder as Registry['health']['types'],
  },
  'inventory.index': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['inventory.index']['types'],
  },
  'inventory.store': {
    methods: ["POST"],
    pattern: '/inventory',
    tokens: [{"old":"/inventory","type":0,"val":"inventory","end":""}],
    types: placeholder as Registry['inventory.store']['types'],
  },
  'inventory.markdown': {
    methods: ["GET","HEAD"],
    pattern: '/inventory/markdown',
    tokens: [{"old":"/inventory/markdown","type":0,"val":"inventory","end":""},{"old":"/inventory/markdown","type":0,"val":"markdown","end":""}],
    types: placeholder as Registry['inventory.markdown']['types'],
  },
  'inventory.update': {
    methods: ["PATCH"],
    pattern: '/inventory/:id',
    tokens: [{"old":"/inventory/:id","type":0,"val":"inventory","end":""},{"old":"/inventory/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['inventory.update']['types'],
  },
  'inventory.adjust': {
    methods: ["POST"],
    pattern: '/inventory/:id/adjust',
    tokens: [{"old":"/inventory/:id/adjust","type":0,"val":"inventory","end":""},{"old":"/inventory/:id/adjust","type":1,"val":"id","end":""},{"old":"/inventory/:id/adjust","type":0,"val":"adjust","end":""}],
    types: placeholder as Registry['inventory.adjust']['types'],
  },
  'inventory.destroy': {
    methods: ["DELETE"],
    pattern: '/inventory/:id',
    tokens: [{"old":"/inventory/:id","type":0,"val":"inventory","end":""},{"old":"/inventory/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['inventory.destroy']['types'],
  },
  'recipes.index': {
    methods: ["GET","HEAD"],
    pattern: '/recipes',
    tokens: [{"old":"/recipes","type":0,"val":"recipes","end":""}],
    types: placeholder as Registry['recipes.index']['types'],
  },
  'recipes.show': {
    methods: ["GET","HEAD"],
    pattern: '/recipes/:id',
    tokens: [{"old":"/recipes/:id","type":0,"val":"recipes","end":""},{"old":"/recipes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['recipes.show']['types'],
  },
  'recipes.destroy': {
    methods: ["DELETE"],
    pattern: '/recipes/:id',
    tokens: [{"old":"/recipes/:id","type":0,"val":"recipes","end":""},{"old":"/recipes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['recipes.destroy']['types'],
  },
  'new_account.create': {
    methods: ["GET","HEAD"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.create']['types'],
  },
  'new_account.store': {
    methods: ["POST"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'session.create': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.create']['types'],
  },
  'session.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.store']['types'],
  },
  'password.forgot': {
    methods: ["GET","HEAD"],
    pattern: '/forgot-password',
    tokens: [{"old":"/forgot-password","type":0,"val":"forgot-password","end":""}],
    types: placeholder as Registry['password.forgot']['types'],
  },
  'password.email': {
    methods: ["POST"],
    pattern: '/forgot-password',
    tokens: [{"old":"/forgot-password","type":0,"val":"forgot-password","end":""}],
    types: placeholder as Registry['password.email']['types'],
  },
  'password.reset': {
    methods: ["GET","HEAD"],
    pattern: '/reset-password/:token',
    tokens: [{"old":"/reset-password/:token","type":0,"val":"reset-password","end":""},{"old":"/reset-password/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['password.reset']['types'],
  },
  'password.update': {
    methods: ["POST"],
    pattern: '/reset-password',
    tokens: [{"old":"/reset-password","type":0,"val":"reset-password","end":""}],
    types: placeholder as Registry['password.update']['types'],
  },
  'verification.verify': {
    methods: ["GET","HEAD"],
    pattern: '/verify-email/:token',
    tokens: [{"old":"/verify-email/:token","type":0,"val":"verify-email","end":""},{"old":"/verify-email/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['verification.verify']['types'],
  },
  'verification.notice': {
    methods: ["GET","HEAD"],
    pattern: '/verify-email',
    tokens: [{"old":"/verify-email","type":0,"val":"verify-email","end":""}],
    types: placeholder as Registry['verification.notice']['types'],
  },
  'verification.resend': {
    methods: ["POST"],
    pattern: '/verify-email/resend',
    tokens: [{"old":"/verify-email/resend","type":0,"val":"verify-email","end":""},{"old":"/verify-email/resend","type":0,"val":"resend","end":""}],
    types: placeholder as Registry['verification.resend']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['session.destroy']['types'],
  },
  'account.show': {
    methods: ["GET","HEAD"],
    pattern: '/account',
    tokens: [{"old":"/account","type":0,"val":"account","end":""}],
    types: placeholder as Registry['account.show']['types'],
  },
  'account.profile.update': {
    methods: ["POST"],
    pattern: '/account/profile',
    tokens: [{"old":"/account/profile","type":0,"val":"account","end":""},{"old":"/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['account.profile.update']['types'],
  },
  'account.email.update': {
    methods: ["POST"],
    pattern: '/account/email',
    tokens: [{"old":"/account/email","type":0,"val":"account","end":""},{"old":"/account/email","type":0,"val":"email","end":""}],
    types: placeholder as Registry['account.email.update']['types'],
  },
  'account.password.update': {
    methods: ["POST"],
    pattern: '/account/password',
    tokens: [{"old":"/account/password","type":0,"val":"account","end":""},{"old":"/account/password","type":0,"val":"password","end":""}],
    types: placeholder as Registry['account.password.update']['types'],
  },
  'account.destroy': {
    methods: ["DELETE"],
    pattern: '/account',
    tokens: [{"old":"/account","type":0,"val":"account","end":""}],
    types: placeholder as Registry['account.destroy']['types'],
  },
  'account.mcp_tokens.store': {
    methods: ["POST"],
    pattern: '/account/mcp-tokens',
    tokens: [{"old":"/account/mcp-tokens","type":0,"val":"account","end":""},{"old":"/account/mcp-tokens","type":0,"val":"mcp-tokens","end":""}],
    types: placeholder as Registry['account.mcp_tokens.store']['types'],
  },
  'account.mcp_tokens.destroy': {
    methods: ["DELETE"],
    pattern: '/account/mcp-tokens/:id',
    tokens: [{"old":"/account/mcp-tokens/:id","type":0,"val":"account","end":""},{"old":"/account/mcp-tokens/:id","type":0,"val":"mcp-tokens","end":""},{"old":"/account/mcp-tokens/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['account.mcp_tokens.destroy']['types'],
  },
  'cooking.start': {
    methods: ["POST"],
    pattern: '/recipes/:id/cook',
    tokens: [{"old":"/recipes/:id/cook","type":0,"val":"recipes","end":""},{"old":"/recipes/:id/cook","type":1,"val":"id","end":""},{"old":"/recipes/:id/cook","type":0,"val":"cook","end":""}],
    types: placeholder as Registry['cooking.start']['types'],
  },
  'cooking.join': {
    methods: ["GET","HEAD"],
    pattern: '/cook/join',
    tokens: [{"old":"/cook/join","type":0,"val":"cook","end":""},{"old":"/cook/join","type":0,"val":"join","end":""}],
    types: placeholder as Registry['cooking.join']['types'],
  },
  'cooking.join.store': {
    methods: ["POST"],
    pattern: '/cook/join',
    tokens: [{"old":"/cook/join","type":0,"val":"cook","end":""},{"old":"/cook/join","type":0,"val":"join","end":""}],
    types: placeholder as Registry['cooking.join.store']['types'],
  },
  'cooking.show': {
    methods: ["GET","HEAD"],
    pattern: '/cook/:code',
    tokens: [{"old":"/cook/:code","type":0,"val":"cook","end":""},{"old":"/cook/:code","type":1,"val":"code","end":""}],
    types: placeholder as Registry['cooking.show']['types'],
  },
  'cooking.state': {
    methods: ["GET","HEAD"],
    pattern: '/cook/:code/state',
    tokens: [{"old":"/cook/:code/state","type":0,"val":"cook","end":""},{"old":"/cook/:code/state","type":1,"val":"code","end":""},{"old":"/cook/:code/state","type":0,"val":"state","end":""}],
    types: placeholder as Registry['cooking.state']['types'],
  },
  'cooking.state.update': {
    methods: ["PATCH"],
    pattern: '/cook/:code/state',
    tokens: [{"old":"/cook/:code/state","type":0,"val":"cook","end":""},{"old":"/cook/:code/state","type":1,"val":"code","end":""},{"old":"/cook/:code/state","type":0,"val":"state","end":""}],
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
