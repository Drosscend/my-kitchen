import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'inventory.index': { paramsTuple?: []; params?: {} }
    'inventory.store': { paramsTuple?: []; params?: {} }
    'inventory.markdown': { paramsTuple?: []; params?: {} }
    'inventory.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inventory.adjust': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'inventory.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'recipes.index': { paramsTuple?: []; params?: {} }
    'recipes.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'recipes.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'mcp': { paramsTuple?: []; params?: {} }
    'mcp.protected_resource': { paramsTuple?: []; params?: {} }
    'mcp.protected_resource.root': { paramsTuple?: []; params?: {} }
    'oauth.authorization.show': { paramsTuple: [ParamValue]; params: {'uid': ParamValue} }
    'oauth.authorization.approve': { paramsTuple: [ParamValue]; params: {'uid': ParamValue} }
    'oauth.authorization.deny': { paramsTuple: [ParamValue]; params: {'uid': ParamValue} }
    'up': { paramsTuple?: []; params?: {} }
    'health': { paramsTuple?: []; params?: {} }
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
    'account.oauth_connections.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cooking.start': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cooking.join': { paramsTuple?: []; params?: {} }
    'cooking.join.store': { paramsTuple?: []; params?: {} }
    'cooking.show': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'cooking.state': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'cooking.state.update': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
  }
  GET: {
    'inventory.index': { paramsTuple?: []; params?: {} }
    'inventory.markdown': { paramsTuple?: []; params?: {} }
    'recipes.index': { paramsTuple?: []; params?: {} }
    'recipes.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'mcp': { paramsTuple?: []; params?: {} }
    'mcp.protected_resource': { paramsTuple?: []; params?: {} }
    'mcp.protected_resource.root': { paramsTuple?: []; params?: {} }
    'oauth.authorization.show': { paramsTuple: [ParamValue]; params: {'uid': ParamValue} }
    'up': { paramsTuple?: []; params?: {} }
    'health': { paramsTuple?: []; params?: {} }
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
  HEAD: {
    'inventory.index': { paramsTuple?: []; params?: {} }
    'inventory.markdown': { paramsTuple?: []; params?: {} }
    'recipes.index': { paramsTuple?: []; params?: {} }
    'recipes.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'mcp.protected_resource': { paramsTuple?: []; params?: {} }
    'mcp.protected_resource.root': { paramsTuple?: []; params?: {} }
    'oauth.authorization.show': { paramsTuple: [ParamValue]; params: {'uid': ParamValue} }
    'up': { paramsTuple?: []; params?: {} }
    'health': { paramsTuple?: []; params?: {} }
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
  POST: {
    'inventory.store': { paramsTuple?: []; params?: {} }
    'inventory.adjust': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'mcp': { paramsTuple?: []; params?: {} }
    'oauth.authorization.approve': { paramsTuple: [ParamValue]; params: {'uid': ParamValue} }
    'oauth.authorization.deny': { paramsTuple: [ParamValue]; params: {'uid': ParamValue} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'password.email': { paramsTuple?: []; params?: {} }
    'password.update': { paramsTuple?: []; params?: {} }
    'verification.resend': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'account.profile.update': { paramsTuple?: []; params?: {} }
    'account.email.update': { paramsTuple?: []; params?: {} }
    'account.password.update': { paramsTuple?: []; params?: {} }
    'cooking.start': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cooking.join.store': { paramsTuple?: []; params?: {} }
  }
  PATCH: {
    'inventory.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cooking.state.update': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
  }
  DELETE: {
    'inventory.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'recipes.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'mcp': { paramsTuple?: []; params?: {} }
    'account.destroy': { paramsTuple?: []; params?: {} }
    'account.oauth_connections.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}