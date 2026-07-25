import { CookingSessionUpdateSchema } from "@/features/recipes/schemas";
import { readSession, writeSession } from "@/features/recipes/session-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await readSession(id);

  if (!session) {
    return Response.json({ error: "Session introuvable" }, { status: 404 });
  }

  return Response.json({ ...session, serverNow: Date.now() });
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
  const result = CookingSessionUpdateSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { error: "Données invalides", details: result.error.issues },
      { status: 400 },
    );
  }

  // updatedAt is stamped here and nowhere else: this is the only clock every
  // device in a session shares. A browser clock can lag by seconds, which used
  // to get its updates dropped as stale. Only the fields that actually changed
  // reach us, so a device holding an outdated view cannot overwrite what
  // another one just changed.
  session.state = { ...session.state, ...result.data, updatedAt: Date.now() };
  await writeSession(id, session);

  return Response.json({ ...session, serverNow: Date.now() });
}
