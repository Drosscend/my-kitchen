# Mon Garde-Manger domain

This glossary defines the domain language of the application.

## Identity

**User**:
A person who owns an account, identified by a confirmed e-mail address. Everything else in the application belongs to one user.

**E-mail verification token**:
A single use, hashed token mailed as a link to the address a user must confirm, either at signup or when changing address. The address becomes the account address once the link is opened.

**Password reset token**:
A single use, hashed token mailed as a link to a user who forgot their password. Changing the password revokes it.

**MCP token**:
A personal access token, shown once and stored hashed, that an assistant sends as a bearer to the MCP endpoint. It acts as its owner.

## Inventory

**Ingredient**:
An item of the pantry: a name, a quantity in one of six units, one of eight categories, and a state, fresh or frozen.

**Catalog**:
The fixed lists of categories, units and states, with the low stock threshold and the perishability of each category. Constants of the code, never edited by users.

**Low stock**:
An ingredient whose quantity, converted to grams or millilitres, is under the threshold of its category.

**Perishable**:
A fresh ingredient of a perishable category. Freezing suspends perishability.

## Recipes

**Recipe**:
A document owned by a user: title, description, base servings, notes, ingredients and steps.

**Ref**:
The short key of a recipe ingredient or step, chosen by whoever wrote the recipe. A step mentions an ingredient as `{ref}` and its own timer as `{timer}`; timers of a cooking session are tracked under the step ref.

**Recipe document**:
The JSON shape assistants send to the MCP tools: snake_case keys, `id` as the ref.

## Cooking

**Cooking session**:
A frozen copy of a recipe at a chosen scale, under a six digit code, valid six hours after its last change. Whoever holds the code follows the steps and drives the timers, no account needed.

**Synced timer**:
A running timer stores when it started in server time; a paused one stores what is left. Every device derives the remaining time from the server clock.
