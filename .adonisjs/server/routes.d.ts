import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'mcp': { paramsTuple?: []; params?: {} }
    'health': { paramsTuple?: []; params?: {} }
    'inventory.index': { paramsTuple?: []; params?: {} }
    'inventory.store': { paramsTuple?: []; params?: {} }
    'inventory.import': { paramsTuple?: []; params?: {} }
    'inventory.export': { paramsTuple: [ParamValue]; params: {'format': ParamValue} }
    'inventory.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inventory.adjust': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inventory.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'recipes.index': { paramsTuple?: []; params?: {} }
    'recipes.import': { paramsTuple?: []; params?: {} }
    'recipes.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'recipes.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'recipes.cook': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'password.forgot': { paramsTuple?: []; params?: {} }
    'password.email': { paramsTuple?: []; params?: {} }
    'password.reset': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'password.update': { paramsTuple?: []; params?: {} }
    'verification.verify': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'verification.notice': { paramsTuple?: []; params?: {} }
    'verification.resend': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'account.show': { paramsTuple?: []; params?: {} }
    'account.profile.update': { paramsTuple?: []; params?: {} }
    'account.email.update': { paramsTuple?: []; params?: {} }
    'account.password.update': { paramsTuple?: []; params?: {} }
    'account.destroy': { paramsTuple?: []; params?: {} }
    'account.mcp_tokens.store': { paramsTuple?: []; params?: {} }
    'account.mcp_tokens.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cooking.join': { paramsTuple?: []; params?: {} }
    'cooking.join.store': { paramsTuple?: []; params?: {} }
    'cooking.show': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'cooking.state': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'cooking.state.update': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
  }
  POST: {
    'mcp': { paramsTuple?: []; params?: {} }
    'inventory.store': { paramsTuple?: []; params?: {} }
    'inventory.import': { paramsTuple?: []; params?: {} }
    'inventory.adjust': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'recipes.import': { paramsTuple?: []; params?: {} }
    'recipes.cook': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'password.email': { paramsTuple?: []; params?: {} }
    'password.update': { paramsTuple?: []; params?: {} }
    'verification.resend': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'account.profile.update': { paramsTuple?: []; params?: {} }
    'account.email.update': { paramsTuple?: []; params?: {} }
    'account.password.update': { paramsTuple?: []; params?: {} }
    'account.mcp_tokens.store': { paramsTuple?: []; params?: {} }
    'cooking.join.store': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'mcp': { paramsTuple?: []; params?: {} }
    'health': { paramsTuple?: []; params?: {} }
    'inventory.index': { paramsTuple?: []; params?: {} }
    'inventory.export': { paramsTuple: [ParamValue]; params: {'format': ParamValue} }
    'recipes.index': { paramsTuple?: []; params?: {} }
    'recipes.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'password.forgot': { paramsTuple?: []; params?: {} }
    'password.reset': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'verification.verify': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'verification.notice': { paramsTuple?: []; params?: {} }
    'account.show': { paramsTuple?: []; params?: {} }
    'cooking.join': { paramsTuple?: []; params?: {} }
    'cooking.show': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'cooking.state': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
  }
  DELETE: {
    'mcp': { paramsTuple?: []; params?: {} }
    'inventory.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'recipes.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'account.destroy': { paramsTuple?: []; params?: {} }
    'account.mcp_tokens.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'health': { paramsTuple?: []; params?: {} }
    'inventory.index': { paramsTuple?: []; params?: {} }
    'inventory.export': { paramsTuple: [ParamValue]; params: {'format': ParamValue} }
    'recipes.index': { paramsTuple?: []; params?: {} }
    'recipes.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'password.forgot': { paramsTuple?: []; params?: {} }
    'password.reset': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'verification.verify': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'verification.notice': { paramsTuple?: []; params?: {} }
    'account.show': { paramsTuple?: []; params?: {} }
    'cooking.join': { paramsTuple?: []; params?: {} }
    'cooking.show': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'cooking.state': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
  }
  PATCH: {
    'inventory.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cooking.state.update': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}