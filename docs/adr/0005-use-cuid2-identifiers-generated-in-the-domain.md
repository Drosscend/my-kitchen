# Use cuid2 identifiers generated in the domain

Every aggregate root has a `text` primary key holding a cuid2 produced by `Identifier.generate()` in the application, never by the database. Line items owned by an aggregate (recipe ingredients and steps) take a raw cuid2 from the repository, and cooking sessions are keyed by their six digit code. One convention covers users, tokens, and the pantry data imported from the previous site, whose free-form ids were dropped rather than preserved.
