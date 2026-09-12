# Mon Garde-Manger

Kitchen inventory, recipe library and shared cooking mode, one account per user. AdonisJS 7 with Inertia 3 and React 19, PostgreSQL through Kysely, deployed on a Dokploy VPS.

## Requirements

- Node.js 24 or newer;
- Docker with Docker Compose.

## Installation

```bash
npm install
cp .env.example .env
node ace generate:key
docker compose up -d
npm run db:migrate
npm run dev
```

The application is served at [http://localhost:3333](http://localhost:3333). Mails sent locally land in Mailpit at [http://localhost:8025](http://localhost:8025).

Tests run on a separate database, created once:

```bash
docker exec my-kitchen-postgres-1 psql -U my_kitchen -c "CREATE DATABASE my_kitchen_test"
npm test
```

## Commands

| Command              | Purpose                                      |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | Start AdonisJS with HMR                      |
| `npm run build`      | Production build                             |
| `npm test`           | Run the unit and functional suites           |
| `npm run typecheck`  | Type-check the server and the Inertia client |
| `npm run lint`       | Check the repository with Oxlint             |
| `npm run format`     | Check formatting with Oxfmt                  |
| `npm run db:migrate` | Execute pending Kysely migrations            |
| `npm run db:fresh`   | Drop every table and rerun the migrations    |
| `npm run db:codegen` | Regenerate `types/db.ts` from the database   |

Create a user with an already confirmed address from the command line:

```bash
node ace create:user --name='Ada' --email='ada@example.com' --password='a-secure-password'
```

## Deployment

`docker-compose.yml` is the production stack read by Dokploy: the application image built from `Dockerfile` and a PostgreSQL 17 service on an internal network. Every variable it references is set in the Dokploy environment, see `.env.example` for the list. Migrations run when the container starts.

## Documentation

- [Agent instructions](AGENTS.md): repository-wide rules and verification commands.
- [Domain glossary](CONTEXT.md): canonical language of the capabilities.
- [Application architecture](docs/architecture/application.md): dependency direction, controllers, Actions, Queries, domain modeling, Results, and transactions.
- [Decision records](docs/adr): the choices behind the structure.
