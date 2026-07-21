# Mon Garde-Manger

Inventaire d'ingrédients et gestion de recettes. Next.js 16, React 19, Bun.

L'inventaire et les recettes vivent dans le **localStorage** du navigateur.
Seules les **sessions de cuisine partagées** ont un état serveur : des clés
`cook:<code>` dans Redis, avec un TTL de 24 h.

## Développement

```bash
bun dev          # http://localhost:3000
bun run build    # build de production
bun run check    # lint + format (Biome, auto-fix)
bun run typecheck
```

Une instance Redis est nécessaire pour les sessions partagées :

```bash
docker run -d --name my-kitchen-redis -p 6379:6379 redis:8-alpine
echo 'REDIS_URL=redis://localhost:6379' >> .env.local
```

Le reste de l'application fonctionne sans.

## Déploiement

Hébergé sur le VPS via Dokploy, sur `my-kitchen.kevin-dev.com`.

Le `docker-compose.yml` décrit deux services : `app` (build depuis le
`Dockerfile`, sortie Next `standalone`) et `redis` (persistance AOF sur le
volume `redis-data`). Redis n'est joint qu'au réseau `internal` — il n'est
joignable ni depuis Internet ni depuis les autres projets du VPS.

Variables d'environnement : `REDIS_URL`, définie dans le compose puisqu'elle
ne contient aucun secret.

Le déploiement se déclenche au push sur `main`. La procédure et l'exploitation
sont documentées dans le dépôt Homelab.
