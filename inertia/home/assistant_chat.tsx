import { ArrowUpIcon, ChevronRightIcon, PlusIcon, SlidersHorizontalIcon } from 'lucide-react'
import { type ReactNode } from 'react'

/**
 * One tool call as chat assistants show it: a collapsed line naming the
 * connector and the tool, the exchanged JSON underneath.
 */
function ToolCall({
  tool,
  request,
  response,
}: {
  tool: string
  request: string
  response: string
}) {
  return (
    <details className="group w-fit max-w-full rounded-lg border border-[#e5e2da] bg-white text-[13px] text-[#5e5a54] open:w-full">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-2.5 py-1.5 [&::-webkit-details-marker]:hidden">
        <img src="/logo.svg" alt="" className="size-4 rounded-[4px]" />
        <span>
          Mon Garde-Manger <span className="text-[#9a958d]">›</span>{' '}
          <span className="font-medium text-[#2b2925]">{tool}</span>
        </span>
        <ChevronRightIcon className="size-3.5 transition-transform group-open:rotate-90" />
      </summary>
      <div className="grid gap-2 border-t border-[#e5e2da] p-2.5">
        <p className="text-xs font-medium text-[#9a958d]">Requête</p>
        <pre className="overflow-x-auto rounded-md bg-[#f5f4ef] p-2 font-mono text-xs">
          {request}
        </pre>
        <p className="text-xs font-medium text-[#9a958d]">Réponse</p>
        <pre className="overflow-x-auto rounded-md bg-[#f5f4ef] p-2 font-mono text-xs">
          {response}
        </pre>
      </div>
    </details>
  )
}

function UserMessage({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-[85%] self-end rounded-xl bg-[#f0eee6] px-3.5 py-2.5 text-[15px] text-[#2b2925]">
      {children}
    </p>
  )
}

/**
 * A conversation with an assistant connected to the MCP server, drawn in
 * the neutral look of a chat app rather than the site's.
 */
export function AssistantChat() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#e5e2da] bg-[#faf9f5] font-[system-ui,sans-serif] text-[#2b2925] shadow-[0_40px_60px_-40px_rgb(41_35_30/0.5)]">
      <div className="flex items-center justify-between border-b border-[#ebe8e0] px-4 py-3 text-sm">
        <span className="font-medium">Repas avec ce qui périme</span>
        <span className="text-[#9a958d]">Claude</span>
      </div>

      <div className="flex flex-col gap-4 px-4 py-5 text-[15px] leading-relaxed sm:px-6">
        <UserMessage>Qu'est-ce que je peux cuisiner ce soir avec ce qui va périmer ?</UserMessage>

        <div className="flex flex-col gap-2">
          <ToolCall
            tool="list_ingredients"
            request="{}"
            response={`{ "ingredients": [
  { "name": "Champignons de Paris", "quantity": 250,
    "unit": "g", "expiryStatus": "soon", "daysLeft": 0 },
  { "name": "Aubergine", "quantity": 350,
    "unit": "g", "expiryStatus": "soon", "daysLeft": 2 },
  … ] }`}
          />
          <ToolCall
            tool="list_recipes"
            request="{}"
            response={`{ "recipes": [
  { "title": "Risotto aux champignons", … },
  { "title": "Ratatouille au four", … },
  … ] }`}
          />
          <p>
            Tes champignons de Paris sont à manger aujourd'hui et l'aubergine d'ici deux jours. Deux
            recettes de ta bibliothèque les utilisent :
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="font-semibold">Risotto aux champignons</strong>, tu as tout ce
              qu'il faut ;
            </li>
            <li>
              <strong className="font-semibold">Ratatouille au four</strong>, il te manque des
              poivrons.
            </li>
          </ul>
        </div>

        <UserMessage>
          Va pour le risotto, pour deux. C'est fait, tu peux mettre à jour ?
        </UserMessage>

        <div className="flex flex-col gap-2">
          <ToolCall
            tool="consume_ingredients"
            request={`{ "items": [
  { "id": "q2mjv8f0yw4k7r1c9tzn3hxa", "quantity": 160 },
  { "id": "b7ts0kq3xe6p9w2lc4vm8dnr", "quantity": 125 },
  { "id": "h4zc1n8wq0ry5v3kt7m2lepu", "quantity": 30 } ] }`}
            response={`{ "ingredients": [
  { "name": "Champignons de Paris", "quantity": 125, … },
  … ] }`}
          />
          <p>
            C'est noté : j'ai retiré 160 g de riz, 125 g de champignons et 30 g de parmesan, en
            commençant par les lots les plus anciens. Il reste 125 g de champignons à finir demain.
          </p>
        </div>
      </div>

      <div className="mx-3 mb-3 rounded-2xl border border-[#e0ddd4] bg-white p-3 shadow-[0_2px_6px_-4px_rgb(0_0_0/0.2)]">
        <p className="px-1 pb-3 text-[15px] text-[#9a958d]">Répondre…</p>
        <div className="flex items-center gap-2 text-[#5e5a54]">
          <span className="grid size-8 place-items-center rounded-lg border border-[#e0ddd4]">
            <PlusIcon className="size-4" />
          </span>
          <span className="grid size-8 place-items-center rounded-lg border border-[#e0ddd4]">
            <SlidersHorizontalIcon className="size-4" />
          </span>
          <span className="ml-auto grid size-8 place-items-center rounded-lg bg-[#c9c5bb] text-white">
            <ArrowUpIcon className="size-4" />
          </span>
        </div>
      </div>
    </div>
  )
}
