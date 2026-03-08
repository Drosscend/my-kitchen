import { kv } from "@vercel/kv";
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
  const updates: Partial<CookingSessionState> = await request.json();

  if (updates.updatedAt && updates.updatedAt <= session.state.updatedAt) {
    return Response.json(session);
  }

  session.state = { ...session.state, ...updates };
  await kv.set(`cook:${id}`, JSON.stringify(session), { ex: 86400 });

  return Response.json(session);
}
