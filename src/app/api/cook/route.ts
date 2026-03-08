import { kv } from "@vercel/kv";
import { z } from "zod/v4";
import { RecipeSchema, SyncedTimerSchema } from "@/features/recipes/schemas";
import type { CookingSession } from "@/features/recipes/types";

const CreateSessionSchema = z.object({
  recipe: RecipeSchema,
  scale: z.number().positive(),
  currentStepIndex: z.number().optional(),
  activeTimers: z.record(z.string(), SyncedTimerSchema).optional(),
});

async function generateUniqueCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const existing = await kv.exists(`cook:${code}`);
    if (!existing) return code;
  }
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = CreateSessionSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { error: "Données invalides", details: result.error.issues },
      { status: 400 },
    );
  }

  const { recipe, scale, currentStepIndex, activeTimers } = result.data;

  const id = await generateUniqueCode();
  const session: CookingSession = {
    recipe,
    scale,
    state: {
      currentStepIndex: currentStepIndex ?? -1,
      completedSteps: [],
      activeTimers: activeTimers ?? {},
      closed: false,
      updatedAt: Date.now(),
    },
  };

  await kv.set(`cook:${id}`, JSON.stringify(session), { ex: 86400 });

  return Response.json({ id });
}
