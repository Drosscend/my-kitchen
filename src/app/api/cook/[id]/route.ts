import { CookingSessionStateSchema } from "@/features/recipes/schemas";
import { readSession, writeSession } from "@/features/recipes/session-store";
import type { CookingSessionState } from "@/features/recipes/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await readSession(id);

  if (!session) {
    return Response.json({ error: "Session introuvable" }, { status: 404 });
  }

  return Response.json(session);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await readSession(id);

  if (!session) {
    return Response.json({ error: "Session introuvable" }, { status: 404 });
  }

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
  await writeSession(id, session);

  return Response.json(session);
}
