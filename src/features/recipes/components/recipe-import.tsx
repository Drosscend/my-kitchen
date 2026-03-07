"use client";

import { FileUpIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface ImportResult {
  error?: string;
  added?: number;
  replaced?: number;
}

interface RecipeImportProps {
  onImport: (json: string) => ImportResult;
}

export function RecipeImport({ onImport }: RecipeImportProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = useCallback(
    (json: string) => {
      const result = onImport(json);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
        return;
      }
      const parts: string[] = [];
      if (result.added && result.added > 0) {
        parts.push(
          `${result.added} recette${result.added > 1 ? "s" : ""} ajoutée${result.added > 1 ? "s" : ""}`,
        );
      }
      if (result.replaced && result.replaced > 0) {
        parts.push(
          `${result.replaced} recette${result.replaced > 1 ? "s" : ""} remplacée${result.replaced > 1 ? "s" : ""}`,
        );
      }
      setFeedback({
        type: "success",
        message: parts.join(", ") || "Import terminé.",
      });
      setJsonInput("");
    },
    [onImport],
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          handleImport(reader.result);
        }
      };
      reader.readAsText(file);
      // Reset input so same file can be re-uploaded
      e.target.value = "";
    },
    [handleImport],
  );

  const handleTextareaImport = () => {
    if (!jsonInput.trim()) return;
    handleImport(jsonInput);
  };

  return (
    <Card className="kraft-card">
      <CardContent className="pt-4">
        {/* File upload zone */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-border border-dashed px-4 py-6 transition-colors hover:border-accent hover:bg-accent/5"
        >
          <FileUpIcon className="size-8 text-muted-foreground" />
          <span className="text-muted-foreground text-sm">
            Cliquer pour charger un fichier JSON
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Separator */}
        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-muted-foreground text-xs">ou</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Textarea */}
        <Textarea
          value={jsonInput}
          onChange={(e) => {
            setJsonInput(e.target.value);
            setFeedback(null);
          }}
          placeholder="Coller le JSON ici..."
          rows={6}
          className="font-mono text-xs"
        />

        {/* Feedback */}
        {feedback && (
          <p
            className={`mt-2 text-xs ${feedback.type === "error" ? "text-destructive" : "text-accent"}`}
          >
            {feedback.message}
          </p>
        )}

        <div className="mt-3">
          <Button onClick={handleTextareaImport} disabled={!jsonInput.trim()}>
            Importer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
