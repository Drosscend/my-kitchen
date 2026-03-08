"use client";

import { CookingPotIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CookJoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (trimmed.length !== 6) return;

    const r = await fetch(`/api/cook/${trimmed}`);
    if (r.ok) {
      router.push(`/cook/${trimmed}`);
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper p-4">
      <div className="flex items-center gap-2 text-foreground">
        <CookingPotIcon className="size-8" />
        <h1 className="kraft-title font-bold text-2xl">
          Rejoindre une session
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-4"
      >
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, ""));
            setError(false);
          }}
          placeholder="000000"
          className="w-48 rounded-lg border border-border bg-background p-3 text-center font-bold font-mono text-3xl tracking-[0.3em] outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        {error && (
          <p className="text-destructive text-sm">Session introuvable</p>
        )}
        <Button type="submit" disabled={code.length !== 6}>
          Rejoindre
        </Button>
      </form>
    </div>
  );
}
