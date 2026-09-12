# Vendor shadcn components instead of a design system package

The reusable UI is the set of shadcn components (Base UI variant) copied into `inertia/components/ui`, styled through `cva` and `cn`, with the Kraft Rustique theme in `inertia/css/app.css`. They stay diffable with the registry: both Oxlint and Oxfmt ignore the folder, and only their import paths were adapted. A separate design-system package, Ark UI, and Storybook were left out: one application consumes these primitives.
