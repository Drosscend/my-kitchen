"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface JsonEditorProps {
  onLoad: (json: string) => string | null;
  onClose: () => void;
}

export function JsonEditor({ onLoad, onClose }: JsonEditorProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLoad = () => {
    const err = onLoad(jsonInput);
    if (err) {
      setError(err);
    } else {
      setError(null);
      setJsonInput("");
      onClose();
    }
  };

  return (
    <Card className="kraft-card mb-6">
      <CardContent className="pt-4">
        <Textarea
          value={jsonInput}
          onChange={(e) => {
            setJsonInput(e.target.value);
            setError(null);
          }}
          placeholder="Colle le JSON de ta recette ici..."
          rows={8}
          className="font-mono text-xs"
        />
        {error && <p className="mt-2 text-destructive text-xs">{error}</p>}
        <div className="mt-3 flex gap-2">
          <Button onClick={handleLoad}>Charger la recette</Button>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
