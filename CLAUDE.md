# CLAUDE.md

Mon Garde-Manger : inventaire de cuisine, recettes et mode cuisine partagé, avec un compte par utilisateur. Application AdonisJS 7, Inertia 3 + React 19, Kysely + PostgreSQL, hébergée sur le VPS via Dokploy.

Les règles du dépôt sont dans [AGENTS.md](AGENTS.md), l'architecture dans [docs/architecture/application.md](docs/architecture/application.md), le vocabulaire dans [CONTEXT.md](CONTEXT.md), les décisions dans `docs/adr/`. Ce fichier ne liste que les écarts avec les règles globales.

## Écarts

- Gestionnaire de paquets : npm, imposé par l'alignement avec kevin-dev.com.
- Lint et format : oxlint + oxfmt, config et règles maison copiées de kevin-dev.com (`tools/oxlint/`).
- Tests : Japa (`npm test`), unitaires sur les Actions et le domaine, fonctionnels sur les routes avec le client API, sans suite navigateur. Ils exigent le Postgres de `compose.yaml` et une base `my_kitchen_test`.
- Session : cookie de 30 jours sans jeton « se souvenir de moi », un seul foyer par compte.
- Le dossier `inertia/components/ui/` est du code fourni par shadcn : jamais reformaté ni nettoyé.

## Commandes

```bash
docker compose up -d      # Postgres 17 et Mailpit (http://localhost:8025)
npm run dev               # http://localhost:3333
npm run db:migrate        # migrations Kysely
npm run db:codegen        # régénère types/db.ts depuis la base
npm run lint && npm run format && npm run typecheck && npm test
```
