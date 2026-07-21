import { connection } from "next/server";
import { pingRedis } from "@/features/recipes/session-store";

// Readiness probe: unlike /api/health, this fails when a dependency is down.
// Kept out of the container healthcheck on purpose — restarting the app does
// not fix an unreachable Redis.
export async function GET() {
  await connection();

  const redisUp = await pingRedis();

  return Response.json(
    { status: redisUp ? "ok" : "degraded", redis: redisUp ? "up" : "down" },
    { status: redisUp ? 200 : 503 },
  );
}
