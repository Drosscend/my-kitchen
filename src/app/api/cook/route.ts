import { kv } from "@vercel/kv";
import type { CookingSession } from "@/features/recipes/types";

async function generateUniqueCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const existing = await kv.exists(`cook:${code}`);
    if (!existing) return code;
  }
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request: Request) {
  const { recipe, scale } = await request.json();

  const id = await generateUniqueCode();
  const session: CookingSession = {
    recipe,
    scale,
    state: {
      currentStepIndex: -1,
      completedSteps: [],
      activeTimers: {},
      closed: false,
      updatedAt: Date.now(),
    },
  };

  await kv.set(`cook:${id}`, JSON.stringify(session), { ex: 86400 });

  return Response.json({ id });
}
