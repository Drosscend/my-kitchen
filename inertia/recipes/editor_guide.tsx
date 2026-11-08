import { AtSignIcon, BoldIcon, ChevronDownIcon, InfoIcon, PlusIcon, TimerIcon } from 'lucide-react'

export function EditorGuide({ open }: { open: boolean }) {
  return (
    <details
      open={open}
      className="group mb-8 rounded-xl border border-mustard/60 bg-mustard/15 px-5 py-3 sm:mb-10"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold [&::-webkit-details-marker]:hidden">
        <InfoIcon aria-hidden className="size-4 text-primary" />
        Comment ça marche
        <ChevronDownIcon
          aria-hidden
          className="ml-auto size-4 text-muted-foreground transition-transform group-open:rotate-180"
        />
      </summary>
      <ul className="mt-3 grid gap-x-8 gap-y-2.5 pb-1 text-sm leading-relaxed md:grid-cols-2">
        <li className="flex gap-2.5">
          <PlusIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            Écris « 200 g farine » dans le champ des ingrédients puis Entrée : quantité, unité et
            nom sont reconnus. Touche un ingrédient pour le modifier.
          </span>
        </li>
        <li className="flex gap-2.5">
          <AtSignIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            Dans une étape, touche une pastille d’ingrédient pour le citer, ou tape @ sur
            ordinateur. Sa quantité s’affiche et suit tes changements.
          </span>
        </li>
        <li className="flex gap-2.5">
          <TimerIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>Minuteur ajoute un compte à rebours à l’étape, à lancer pendant la cuisine.</span>
        </li>
        <li className="flex gap-2.5">
          <BoldIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>Dans les notes, le bouton B ou **texte** met en gras.</span>
        </li>
      </ul>
    </details>
  )
}
