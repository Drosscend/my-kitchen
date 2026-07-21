import "server-only";
import { createClient, type RedisClientType } from "redis";
import type { CookingSession } from "./types";

const TTL_SECONDS = 86_400;
const CONNECT_TIMEOUT_MS = 3_000;
const PING_TIMEOUT_MS = 2_000;

const sessionKey = (id: string) => `cook:${id}`;

// Reused across hot reloads in dev and across requests in production.
declare global {
  var __redisClient: Promise<RedisClientType> | undefined;
}

function connect(): Promise<RedisClientType> {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL is not set");

  const client: RedisClientType = createClient({
    url,
    socket: { connectTimeout: CONNECT_TIMEOUT_MS },
  });
  client.on("error", (error) => console.error("[redis]", error));
  return client.connect();
}

function redis(): Promise<RedisClientType> {
  // A rejected promise must not stay cached, or every later call inherits the
  // failure and the process never recovers once Redis comes back.
  globalThis.__redisClient ??= connect().catch((error) => {
    globalThis.__redisClient = undefined;
    throw error;
  });
  return globalThis.__redisClient;
}

// A frozen or partitioned Redis keeps the socket open and never answers, so a
// bare command waits forever. Every probe needs its own deadline.
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, deadline]).finally(() => clearTimeout(timer));
}

export async function pingRedis(): Promise<boolean> {
  try {
    const client = await withTimeout(redis(), CONNECT_TIMEOUT_MS);
    const pong = await withTimeout(client.ping(), PING_TIMEOUT_MS);
    return pong === "PONG";
  } catch (error) {
    console.error("[redis] ping failed", error);
    return false;
  }
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
