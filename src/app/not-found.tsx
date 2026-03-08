import { UtensilsCrossedIcon } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper p-4 text-center">
      <UtensilsCrossedIcon className="size-16 text-muted-foreground" />
      <div>
        <h1 className="kraft-title font-bold text-4xl text-foreground">404</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Cette page n'existe pas ou a été déplacée.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-md bg-primary px-6 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
