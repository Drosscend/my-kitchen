# Separate the Adonis BFF from the modular application core

The application is a single npm package. `app` owns Adonis-facing delivery code and Inertia page composition, while `src` owns business capabilities, actions, queries, domain objects, and repositories; `src` never imports from `app`. This keeps controllers thin without preventing business modules from using framework facilities when they add value. The structure comes from RomainLanz/adonis-llm-boilerplate, without its Yarn workspaces and design-system package: one deployable, one lockfile.
