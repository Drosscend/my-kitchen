# Use cuid2 identifiers generated in the domain

Every primary key is a `text` column holding a cuid2 produced by `Identifier.generate()` in the application, never by the database. One convention covers users, tokens, and the pantry data imported from the previous site, whose free-form ids were dropped rather than preserved.
