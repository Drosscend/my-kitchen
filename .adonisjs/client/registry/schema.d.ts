/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'mcp': {
    methods: ["POST","GET","DELETE"]
    pattern: '/mcp'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/mcp/controllers/mcp_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/mcp/controllers/mcp_controller').default['execute']>>>
    }
  }
  'health': {
    methods: ["GET","HEAD"]
    pattern: '/health'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/shared/controllers/health_checks_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/shared/controllers/health_checks_controller').default['execute']>>>
    }
  }
  'inventory.index': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/inventory/controllers/inventory_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/inventory/controllers/inventory_controller').default['render']>>>
    }
  }
  'inventory.store': {
    methods: ["POST"]
    pattern: '/inventory'
    types: {
      body: ExtractBody<InferInput<(typeof import('#app/inventory/controllers/add_ingredient_controller').default)['validator']>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#app/inventory/controllers/add_ingredient_controller').default)['validator']>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/inventory/controllers/add_ingredient_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/inventory/controllers/add_ingredient_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inventory.markdown': {
    methods: ["GET","HEAD"]
    pattern: '/inventory/markdown'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/inventory/controllers/inventory_markdown_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/inventory/controllers/inventory_markdown_controller').default['execute']>>>
    }
  }
  'inventory.update': {
    methods: ["PATCH"]
    pattern: '/inventory/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#app/inventory/controllers/update_ingredient_controller').default)['validator']>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#app/inventory/controllers/update_ingredient_controller').default)['validator']>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/inventory/controllers/update_ingredient_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/inventory/controllers/update_ingredient_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inventory.adjust': {
    methods: ["POST"]
    pattern: '/inventory/:id/adjust'
    types: {
      body: ExtractBody<InferInput<(typeof import('#app/inventory/controllers/adjust_ingredient_quantity_controller').default)['validator']>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#app/inventory/controllers/adjust_ingredient_quantity_controller').default)['validator']>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/inventory/controllers/adjust_ingredient_quantity_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/inventory/controllers/adjust_ingredient_quantity_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'inventory.destroy': {
    methods: ["DELETE"]
    pattern: '/inventory/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/inventory/controllers/remove_ingredient_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/inventory/controllers/remove_ingredient_controller').default['execute']>>>
    }
  }
  'recipes.index': {
    methods: ["GET","HEAD"]
    pattern: '/recipes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/recipes/controllers/recipe_library_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/recipes/controllers/recipe_library_controller').default['render']>>>
    }
  }
  'recipes.show': {
    methods: ["GET","HEAD"]
    pattern: '/recipes/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/recipes/controllers/recipe_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/recipes/controllers/recipe_controller').default['render']>>>
    }
  }
  'recipes.destroy': {
    methods: ["DELETE"]
    pattern: '/recipes/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/recipes/controllers/delete_recipe_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/recipes/controllers/delete_recipe_controller').default['execute']>>>
    }
  }
  'new_account.create': {
    methods: ["GET","HEAD"]
    pattern: '/signup'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/identity/controllers/register_user_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/identity/controllers/register_user_controller').default['render']>>>
    }
  }
  'new_account.store': {
    methods: ["POST"]
    pattern: '/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#app/identity/controllers/register_user_controller').default)['validator']>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#app/identity/controllers/register_user_controller').default)['validator']>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/identity/controllers/register_user_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/identity/controllers/register_user_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'session.create': {
    methods: ["GET","HEAD"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/identity/controllers/login_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/identity/controllers/login_controller').default['render']>>>
    }
  }
  'session.store': {
    methods: ["POST"]
    pattern: '/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#app/identity/controllers/login_controller').default)['validator']>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#app/identity/controllers/login_controller').default)['validator']>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/identity/controllers/login_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/identity/controllers/login_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'password.forgot': {
    methods: ["GET","HEAD"]
    pattern: '/forgot-password'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/identity/controllers/forgot_password_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/identity/controllers/forgot_password_controller').default['render']>>>
    }
  }
  'password.email': {
    methods: ["POST"]
    pattern: '/forgot-password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#app/identity/controllers/forgot_password_controller').default)['validator']>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#app/identity/controllers/forgot_password_controller').default)['validator']>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/identity/controllers/forgot_password_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/identity/controllers/forgot_password_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'password.reset': {
    methods: ["GET","HEAD"]
    pattern: '/reset-password/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/identity/controllers/reset_password_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/identity/controllers/reset_password_controller').default['render']>>>
    }
  }
  'password.update': {
    methods: ["POST"]
    pattern: '/reset-password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#app/identity/controllers/reset_password_controller').default)['validator']>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#app/identity/controllers/reset_password_controller').default)['validator']>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/identity/controllers/reset_password_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/identity/controllers/reset_password_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'verification.verify': {
    methods: ["GET","HEAD"]
    pattern: '/verify-email/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/identity/controllers/verify_email_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/identity/controllers/verify_email_controller').default['execute']>>>
    }
  }
  'verification.notice': {
    methods: ["GET","HEAD"]
    pattern: '/verify-email'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/identity/controllers/email_verification_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/identity/controllers/email_verification_controller').default['render']>>>
    }
  }
  'verification.resend': {
    methods: ["POST"]
    pattern: '/verify-email/resend'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/identity/controllers/email_verification_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/identity/controllers/email_verification_controller').default['execute']>>>
    }
  }
  'session.destroy': {
    methods: ["POST"]
    pattern: '/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/identity/controllers/logout_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/identity/controllers/logout_controller').default['execute']>>>
    }
  }
  'account.show': {
    methods: ["GET","HEAD"]
    pattern: '/account'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/identity/controllers/account_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/identity/controllers/account_controller').default['render']>>>
    }
  }
  'account.profile.update': {
    methods: ["POST"]
    pattern: '/account/profile'
    types: {
      body: ExtractBody<InferInput<(typeof import('#app/identity/controllers/update_profile_controller').default)['validator']>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#app/identity/controllers/update_profile_controller').default)['validator']>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/identity/controllers/update_profile_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/identity/controllers/update_profile_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'account.email.update': {
    methods: ["POST"]
    pattern: '/account/email'
    types: {
      body: ExtractBody<InferInput<(typeof import('#app/identity/controllers/request_email_change_controller').default)['validator']>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#app/identity/controllers/request_email_change_controller').default)['validator']>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/identity/controllers/request_email_change_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/identity/controllers/request_email_change_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'account.password.update': {
    methods: ["POST"]
    pattern: '/account/password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#app/identity/controllers/change_password_controller').default)['validator']>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#app/identity/controllers/change_password_controller').default)['validator']>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/identity/controllers/change_password_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/identity/controllers/change_password_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'account.destroy': {
    methods: ["DELETE"]
    pattern: '/account'
    types: {
      body: ExtractBody<InferInput<(typeof import('#app/identity/controllers/delete_account_controller').default)['validator']>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#app/identity/controllers/delete_account_controller').default)['validator']>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/identity/controllers/delete_account_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/identity/controllers/delete_account_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'account.mcp_tokens.store': {
    methods: ["POST"]
    pattern: '/account/mcp-tokens'
    types: {
      body: ExtractBody<InferInput<(typeof import('#app/identity/controllers/create_mcp_token_controller').default)['validator']>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#app/identity/controllers/create_mcp_token_controller').default)['validator']>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/identity/controllers/create_mcp_token_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/identity/controllers/create_mcp_token_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'account.mcp_tokens.destroy': {
    methods: ["DELETE"]
    pattern: '/account/mcp-tokens/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/identity/controllers/revoke_mcp_token_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/identity/controllers/revoke_mcp_token_controller').default['execute']>>>
    }
  }
  'cooking.start': {
    methods: ["POST"]
    pattern: '/recipes/:id/cook'
    types: {
      body: ExtractBody<InferInput<(typeof import('#app/cooking/controllers/start_cooking_session_controller').default)['validator']>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#app/cooking/controllers/start_cooking_session_controller').default)['validator']>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/cooking/controllers/start_cooking_session_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/cooking/controllers/start_cooking_session_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'cooking.join': {
    methods: ["GET","HEAD"]
    pattern: '/cook/join'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/cooking/controllers/join_cooking_session_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/cooking/controllers/join_cooking_session_controller').default['render']>>>
    }
  }
  'cooking.join.store': {
    methods: ["POST"]
    pattern: '/cook/join'
    types: {
      body: ExtractBody<InferInput<(typeof import('#app/cooking/controllers/join_cooking_session_controller').default)['validator']>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#app/cooking/controllers/join_cooking_session_controller').default)['validator']>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/cooking/controllers/join_cooking_session_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/cooking/controllers/join_cooking_session_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'cooking.show': {
    methods: ["GET","HEAD"]
    pattern: '/cook/:code'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { code: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/cooking/controllers/cooking_session_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/cooking/controllers/cooking_session_controller').default['render']>>>
    }
  }
  'cooking.state': {
    methods: ["GET","HEAD"]
    pattern: '/cook/:code/state'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { code: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/cooking/controllers/cooking_session_state_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/cooking/controllers/cooking_session_state_controller').default['execute']>>>
    }
  }
  'cooking.state.update': {
    methods: ["PATCH"]
    pattern: '/cook/:code/state'
    types: {
      body: ExtractBody<InferInput<(typeof import('#app/cooking/controllers/update_cooking_session_state_controller').default)['validator']>>
      paramsTuple: [ParamValue]
      params: { code: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#app/cooking/controllers/update_cooking_session_state_controller').default)['validator']>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/cooking/controllers/update_cooking_session_state_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/cooking/controllers/update_cooking_session_state_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
}
