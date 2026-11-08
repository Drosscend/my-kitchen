# Mon Garde-Manger domain

This glossary defines the domain language of the application.

## Identity

**User**:
A person who owns an account, identified by a confirmed e-mail address. Everything else in the application belongs to one user.

**E-mail verification token**:
A single use, hashed token mailed as a link to the address a user must confirm, either at signup or when changing address. The address becomes the account address once the link is opened.

**Password reset token**:
A single use, hashed token mailed as a link to a user who forgot their password. Changing the password revokes it.

**Connected application**:
An assistant a user authorized on the consent page to call the MCP endpoint in their name, an OAuth grant in the code. It holds rotating tokens, stored hashed, until it expires or the user revokes it from the account page.

## Inventory

**Ingredient**:
An item of the pantry: a name, one of six units, one of eight categories, a state, fresh or frozen, and its batches. Its quantity is the sum of its batches.

**Batch**:
A part of the stock of an ingredient sharing one expiry date, or none. Taking from an ingredient empties the batches that expire first, undated ones last; adding to it grows the latest batch. An empty batch disappears. "Lot" in the interface.

**Expiry date**:
The date printed on a batch, of one of two kinds: a use by date (DLC) is a safety limit, a best before date (DDM) only a quality one. A new date takes the default kind of its category. Dates are calendar days in the Paris time zone.

**Expiring soon**:
A fresh batch whose use by date is past (expired), whose best before date is past (to check), or whose date falls within the warning days of its category. An ingredient takes the status of its most urgent batch. Freezing suspends expiry.

**Catalog**:
The fixed lists of categories, units, states and expiry kinds, with the low stock threshold, the perishability, the expiry warning days and the default expiry kind of each category. Constants of the code, never edited by users.

**Low stock**:
An ingredient whose quantity, converted to grams or millilitres, is under the threshold of its category.

**Perishable**:
A fresh ingredient of a perishable category. Freezing suspends perishability.

## Recipes

**Recipe**:
A document owned by a user: title, description, base servings, notes, ingredients and steps.

**Ref**:
The short key of a recipe ingredient or step, chosen by the assistant or derived from the ingredient name by the recipe editor, and kept when the ingredient is renamed. A step mentions an ingredient as `{ref}` and its own timer as `{timer}`; timers of a cooking session are tracked under the step ref.

**Recipe document**:
The JSON shape assistants send to the MCP tools: snake_case keys, `id` as the ref.

## Cooking

**Cooking session**:
A frozen copy of a recipe under a six digit code, valid six hours after its last change. Whoever holds the code follows the steps and drives the timers, no account needed.

**Synced timer**:
A running timer stores when it started in server time; a paused one stores what is left. Every device derives the remaining time from the server clock.
