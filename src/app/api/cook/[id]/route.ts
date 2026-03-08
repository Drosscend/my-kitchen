import { kv } from "@vercel/kv";
import { CookingSessionStateSchema } from "@/features/recipes/schemas";
import type {
  CookingSession,
  CookingSessionState,
} from "@/features/recipes/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const raw = await kv.get<string>(`cook:${id}`);

  if (!raw) {
    return Response.json({ error: "Session introuvable" }, { status: 404 });
  }

  const session: CookingSession =
    typeof raw === "string" ? JSON.parse(raw) : raw;
  return Response.json(session);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const raw = await kv.get<string>(`cook:${id}`);

  if (!raw) {
    return Response.json({ error: "Session introuvable" }, { status: 404 });
  }

  const session: CookingSession =
    typeof raw === "string" ? JSON.parse(raw) : raw;

  const body = await request.json();
  const result = CookingSessionStateSchema.partial().safeParse(body);

  if (!result.success) {
    return Response.json(
      { error: "Données invalides", details: result.error.issues },
      { status: 400 },
    );
  }

  const updates: Partial<CookingSessionState> = result.data;

  if (updates.updatedAt && updates.updatedAt <= session.state.updatedAt) {
    return Response.json(session);
  }

  session.state = { ...session.state, ...updates };
  await kv.set(`cook:${id}`, JSON.stringify(session), { ex: 86400 });

  return Response.json(session);
}
