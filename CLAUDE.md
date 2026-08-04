# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

**Mon Garde-Manger** - Application web d'inventaire d'ingrédients de cuisine et de gestion de recettes.

### Fonctionnalités
- CRUD ingrédients avec édition inline et boutons +/- pour les quantités
- 8 catégories (légumes, fruits, viandes, poissons, laitiers, épices, féculents, autres)
- 6 unités (g, kg, mL, L, unité, pièce) et 2 états (frais, congelé)
- Tri et filtres (catégorie, état, recherche, stock bas)
- Export texte formaté pour IA (copie presse-papier, organisé par catégorie)
- Export/Import JSON pour sauvegarde
- Alertes stock bas par catégorie (seuils configurés)
- Bibliothèque de recettes avec import JSON
- Mode cuisine immersif (étape par étape, timers, navigation clavier + swipe)
- Session de cuisine partagée via QR code / code 6 chiffres (sync temps réel entre appareils)
- Convertisseur d'unités avec densités d'ingrédients
- Persistance localStorage (inventaire, recettes) + Redis (sessions partagées)

### Design
Thème "Kraft Rustique" : fond papier kraft beige, palette OKLCH (terracotta, brun doré, vert olive), police manuscrite Kalam, texture noise.

## Commands

```bash
bun dev          # Start development server (http://localhost:3000)
bun run build    # Production build
bun run check    # Lint and format with Biome (auto-fix enabled)
bun run typecheck # TypeScript type checking
bun run test     # Run tests (bun:test, colocated `*.test.ts` files)
```

## Tech Stack

- **Framework**: Next.js 16 with App Router, React 19 + React Compiler
- **UI Components**: Base UI (@base-ui/react) with shadcn style "base-mira"
- **Styling**: Tailwind CSS 4, class-variance-authority (cva)
- **Icons**: lucide-react
- **Real-time**: Redis (`redis` client) for shared cooking sessions, accessed
  only through `src/features/recipes/session-store.ts`
- **Deployment**: self-hosted on the VPS via Dokploy (Dockerfile + compose)
- **QR Code**: qrcode.react

## Architecture

### Directory Structure

- `src/app/` - Next.js App Router pages and layouts
- `src/app/api/cook/` - API routes for shared cooking sessions (Redis)
- `src/app/recettes/cuisiner/[id]/` - Cooking session page (synced via Redis)
- `src/app/recettes/rejoindre/` - Join session page (enter 6-digit code)
- `src/components/ui/` - Reusable UI primitives (Button, Card, Dialog, Select, etc.)
- `src/components/forms/` - Form field components
- `src/features/` - Feature modules with domain logic
- `src/lib/` - Shared utilities (cn function for class merging)

### Feature Module Pattern

Features are organized in `src/features/{feature-name}/` with:
- `types.ts` - TypeScript types and interfaces
- `constants.ts` - Static data, labels, configuration
- `utils.ts` - Pure helper functions
- `hooks/` - React hooks for state and logic
- `components/` - Feature-specific UI components

### Shared Cooking Sessions

Flow: User clicks "Cuisiner" on recipe detail → creates a Redis session (6-digit code, 24h TTL) → redirects to `/recettes/cuisiner/[id]` → can share QR from there. Phone scans QR or enters code at `/recettes/rejoindre` → both devices sync via polling (500ms). Session state in Redis: step index, timers (with `startedAt` timestamps), closed flag. Initial session data is fetched server-side (Partial Prerender).

### UI Component Conventions

- Components use Base UI primitives wrapped with shadcn patterns
- Styling via `cva()` for variants, `cn()` for class merging
- Path alias: `@/` maps to `./src/`
- SelectValue component supports children for custom display labels

## Code Style

- React Compiler is enabled: do NOT use manual `useMemo`/`useCallback` for optimization (the compiler handles it). Use plain functions instead. Use `useEffectEvent` for callbacks referenced in effects that should not re-trigger the effect.
