import "server-only";
import { createClient, type RedisClientType } from "redis";
import type { CookingSession } from "./types";

const TTL_SECONDS = 86_400;

const sessionKey = (id: string) => `cook:${id}`;

// Reused across hot reloads in dev and across requests in production.
declare global {
  var __redisClient: Promise<RedisClientType> | undefined;
}

function connect(): Promise<RedisClientType> {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL is not set");

  const client: RedisClientType = createClient({ url });
  client.on("error", (error) => console.error("[redis]", error));
  return client.connect();
}

function redis(): Promise<RedisClientType> {
  globalThis.__redisClient ??= connect();
  return globalThis.__redisClient;
}

export async function readSession(id: string): Promise<CookingSession | null> {
  const client = await redis();
  const raw = await client.get(sessionKey(id));
  return raw ? (JSON.parse(raw) as CookingSession) : null;
}

export async function writeSession(
  id: string,
  session: CookingSession,
): Promise<void> {
  const client = await redis();
  await client.set(sessionKey(id), JSON.stringify(session), {
    EX: TTL_SECONDS,
  });
}

export async function sessionExists(id: string): Promise<boolean> {
  const client = await redis();
  return (await client.exists(sessionKey(id))) === 1;
}
