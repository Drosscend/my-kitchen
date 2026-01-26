# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

**Mon Garde-Manger** - Application web d'inventaire d'ingrédients de cuisine.

### Fonctionnalités
- CRUD ingrédients avec édition inline et boutons +/- pour les quantités
- 8 catégories (légumes, fruits, viandes, poissons, laitiers, épices, féculents, autres)
- 6 unités (g, kg, mL, L, unité, pièce) et 2 états (frais, congelé)
- Tri et filtres (catégorie, état, recherche, stock bas)
- Export texte formaté pour IA (copie presse-papier, organisé par catégorie)
- Export/Import JSON pour sauvegarde
- Alertes stock bas par catégorie (seuils configurés)
- Persistance localStorage

### Design
Thème "Kraft Rustique" : fond papier kraft beige, palette OKLCH (terracotta, brun doré, vert olive), police manuscrite Kalam, texture noise.

## Commands

```bash
bun dev          # Start development server (http://localhost:3000)
bun run build    # Production build
bun run check    # Lint and format with Biome (auto-fix enabled)
bun run typecheck # TypeScript type checking
```

## Tech Stack

- **Framework**: Next.js 16 with App Router, React 19
- **UI Components**: Base UI (@base-ui/react) with shadcn style "base-mira"
- **Styling**: Tailwind CSS 4, class-variance-authority (cva)
- **Forms**: react-hook-form
- **Icons**: lucide-react
- **Linting/Formatting**: Biome (not ESLint)

## Architecture

### Directory Structure

- `src/app/` - Next.js App Router pages and layouts
- `src/components/ui/` - Reusable UI primitives (Button, Card, Select, etc.)
- `src/components/forms/` - Form field wrappers for react-hook-form
- `src/features/` - Feature modules with domain logic
- `src/lib/` - Shared utilities (cn function for class merging)

### Feature Module Pattern

Features are organized in `src/features/{feature-name}/` with:
- `types.ts` - TypeScript types and interfaces
- `constants.ts` - Static data, labels, configuration
- `utils.ts` - Pure helper functions
- `hooks/` - React hooks for state and logic
- `components/` - Feature-specific UI components

### UI Component Conventions

- Components use Base UI primitives wrapped with shadcn patterns
- Styling via `cva()` for variants, `cn()` for class merging
- Path alias: `@/` maps to `./src/`
- SelectValue component supports children for custom display labels

## Code Style

- Biome enforces double quotes, 2-space indent, sorted Tailwind classes
- Imports are auto-organized by Biome
- French labels in UI, English identifiers in code
