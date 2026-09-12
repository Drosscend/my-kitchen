# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
WORKDIR /app

# All dependencies (build stage)
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Production dependencies only
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# Application build (server + Vite assets)
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN node ace build

FROM base AS production
ENV NODE_ENV=production
ENV PORT=3333
ENV HOST=0.0.0.0
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/build ./
USER node
EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s \
  CMD wget -qO- http://127.0.0.1:3333/health || exit 1

# Migrations run on container start, before the HTTP server
CMD ["sh", "-c", "node ace migrate && node bin/server.js"]
