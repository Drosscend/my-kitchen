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

  // updatedAt est posé ici et nulle part ailleurs. C'est la seule horloge que
  // tous les appareils d'une session partagent : celle du client peut dériver
  // de plusieurs secondes, et une mise à jour serait alors ignorée à tort.
  // Seuls les champs réellement modifiés arrivent, ce qui évite qu'un appareil
  // en retard réécrive par mégarde ce qu'un autre vient de changer.
  session.state = { ...session.state, ...result.data, updatedAt: Date.now() };
  await writeSession(id, session);

  return Response.json({ ...session, serverNow: Date.now() });
}
