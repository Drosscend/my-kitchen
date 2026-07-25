/// <reference types="bun" />
import { expect, mock, test } from "bun:test";
import type { CookingSession } from "@/features/recipes/types";

const store = new Map<string, CookingSession>();

// The real store needs Redis; the route logic under test does not.
mock.module("@/features/recipes/session-store", () => ({
  readSession: async (id: string) => store.get(id) ?? null,
  writeSession: async (id: string, session: CookingSession) => {
    store.set(id, session);
  },
}));

const { PATCH } = await import("./route");

function seed(id: string, updatedAt: number) {
  store.set(id, {
    recipe: {
      id: "recipe",
      title: "Test",
      base_servings: 2,
      ingredients: [],
      steps: [{ id: "s1", content: "Première étape" }],
    },
    scale: 1,
    state: {
      currentStepIndex: -1,
      completedSteps: [],
      activeTimers: {},
      closed: false,
      updatedAt,
    },
  });
}

function patch(id: string, body: unknown) {
  return PATCH(
    new Request(`http://test/api/cook/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) },
  );
}

test("a lagging browser clock no longer blocks the update", async () => {
  // The session was stamped with the server clock, ten seconds ahead of the
  // device's. That gap used to get every step change silently dropped.
  seed("111111", Date.now() + 10_000);

  const body = await (
    await patch("111111", {
      currentStepIndex: 1,
      updatedAt: Date.now() - 10_000,
    })
  ).json();

  expect(body.state.currentStepIndex).toBe(1);
  expect(body.state.updatedAt).toBeLessThanOrEqual(Date.now());
  expect(body.serverNow).toBeGreaterThan(0);
});

test("successive updates keep moving forward", async () => {
  seed("222222", Date.now() + 10_000);

  await patch("222222", {
    currentStepIndex: 0,
    updatedAt: Date.now() - 10_000,
  });
  const body = await (
    await patch("222222", {
      currentStepIndex: 1,
      updatedAt: Date.now() - 10_000,
    })
  ).json();

  expect(body.state.currentStepIndex).toBe(1);
});

test("a partial update leaves the other fields alone", async () => {
  seed("333333", Date.now());
  const session = store.get("333333");
  if (session) session.state.activeTimers = { t1: { total: 60, startedAt: 1 } };

  const body = await (await patch("333333", { currentStepIndex: 3 })).json();

  expect(body.state.currentStepIndex).toBe(3);
  expect(body.state.activeTimers.t1.total).toBe(60);
});

test("an unknown session is a 404", async () => {
  const response = await patch("999999", { currentStepIndex: 1 });

  expect(response.status).toBe(404);
});

test("an invalid payload is rejected", async () => {
  seed("444444", Date.now());

  const response = await patch("444444", { currentStepIndex: "deux" });

  expect(response.status).toBe(400);
  expect(store.get("444444")?.state.currentStepIndex).toBe(-1);
});
