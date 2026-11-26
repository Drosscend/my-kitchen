import { Link } from '@adonisjs/inertia/react'
import { type ReactNode } from 'react'
import { ConnectorGuide } from '~/components/connector_guide'
import { JsonLd, Seo, type SeoMeta } from '~/components/seo'
import { Button } from '~/components/ui/button'
import { AssistantChat } from '~/home/assistant_chat'
import { CookingDevices } from '~/home/cooking_devices'
import { Faq } from '~/home/faq'
import { FridgeCompare } from '~/home/fridge_compare'
import { type Swatch } from '~/swatch'
import { type InertiaProps } from '~/types'

type PageProps = InertiaProps<{ mcpUrl: string; seo: SeoMeta }>

function Point({ swatch, children }: { swatch: Swatch; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[1rem_1fr] items-start gap-3">
      <span
        aria-hidden
        data-swatch={swatch}
        className="magnet mt-[calc((1lh-0.875rem)/2)] size-3.5"
      />
      <span>{children}</span>
    </li>
  )
}

function SignupActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        size="lg"
        className="h-13 px-6 text-base"
        nativeButton={false}
        render={<Link route="new_account.create" />}
      >
        Créer mon garde-manger
      </Button>
      <Button
        variant="outline"
        size="lg"
        className="h-13 bg-card px-6 text-base"
        nativeButton={false}
        render={<Link route="session.create" />}
      >
        J'ai déjà un compte
      </Button>
    </div>
  )
}

export default function Home({ mcpUrl, seo }: PageProps) {
  return (
    <main className="flex-1">
      <Seo meta={seo} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          'name': 'Mon Garde-Manger',
          'url': seo.canonical,
          'description': seo.description,
          'image': seo.image,
          'applicationCategory': 'LifestyleApplication',
          'operatingSystem': 'Web',
          'inLanguage': 'fr',
          'isAccessibleForFree': true,
          'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'EUR' },
          'author': { '@type': 'Person', 'name': 'Kévin Véronési', 'url': 'https://kevin-dev.com' },
        }}
      />

      <section className="page-width grid grid-cols-1 items-center gap-10 pt-8 pb-16 sm:pt-12 lg:grid-cols-2 lg:gap-16 lg:pb-24">
        <div className="flex flex-col gap-6">
          <h1 className="text-5xl leading-[0.98] sm:text-6xl xl:text-7xl">
            Ce que tu as en cuisine, et quoi en faire avant que ça se perde.
          </h1>
          <p className="max-w-xl text-lg text-pretty text-muted-foreground sm:text-xl">
            Mon Garde-Manger tient l'inventaire de ta cuisine avec les dates de péremption et range
            tes recettes. Relié à Claude ou à ChatGPT, il se met à jour d'une photo de tes courses
            et te propose des recettes avec ce qu'il te reste.
          </p>
          <SignupActions />
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <Point swatch="mustard">Gratuit</Point>
            <Point swatch="tomato">Sans publicité</Point>
            <Point swatch="sage">Hébergé en Europe</Point>
          </ul>
        </div>
        <FridgeCompare />
      </section>

      <section className="border-y bg-card py-16 sm:py-24">
        <div className="page-width grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="flex flex-col gap-5">
            <h2 className="text-4xl sm:text-5xl">Ce qui périme d'abord, en haut de la liste.</h2>
            <p className="text-lg text-muted-foreground">
              Tu notes chaque ingrédient avec sa quantité et sa date. Quand tu en as plusieurs
              paquets, chacun garde la sienne. Ce qui arrive à péremption remonte en haut de
              l'inventaire.
            </p>
            <ul className="flex flex-col gap-3.5">
              <Point swatch="tomato">
                <strong>Une DLC dépassée déclenche une alerte.</strong> Une date « à consommer de
                préférence » invite seulement à vérifier.
              </Point>
              <Point swatch="cornflower">
                <strong>Congeler met la date en pause.</strong> Le paquet revient dans les alertes
                quand tu le sors.
              </Point>
              <Point swatch="mustard">
                <strong>Les paquets les plus anciens partent d'abord.</strong> Quand tu retires 200
                g, le stock se vide dans l'ordre des dates.
              </Point>
              <Point swatch="sage">
                <strong>Un seuil de stock bas</strong> te signale ce qu'il faut racheter.
              </Point>
            </ul>
          </div>
          <div className="relative pb-10">
            <img
              src="/landing/inventory-desktop.webp"
              width={2560}
              height={1640}
              loading="lazy"
              alt="Inventaire avec la rangée « À consommer vite » : fraises, courgettes et mozzarella périmées, champignons de Paris à manger aujourd'hui."
              className="w-full rounded-xl paper-stack"
            />
            <img
              src="/landing/inventory-mobile.webp"
              width={780}
              height={1688}
              loading="lazy"
              alt="Le même inventaire sur téléphone, avec la barre d'onglets en bas."
              className="absolute right-[-0.5rem] bottom-0 w-[32%] max-w-52 rounded-[1.75rem] border-[6px] border-[#2b2520] shadow-[0_30px_50px_-24px_rgb(41_35_30/0.55)]"
            />
          </div>
        </div>
      </section>

      <section className="page-width grid grid-cols-1 items-center gap-12 py-16 sm:py-24 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        <div className="rounded-2xl border bg-card p-2 shadow-[0_30px_50px_-24px_rgb(41_35_30/0.45)] max-lg:order-last sm:p-3">
          <img
            src="/landing/recipe-desktop.webp"
            width={2560}
            height={1850}
            loading="lazy"
            alt="Recette de ratatouille : les ingrédients et leurs quantités surlignés dans le texte des étapes."
            className="w-full rounded-lg border"
          />
        </div>
        <div className="flex flex-col gap-5">
          <h2 className="text-4xl sm:text-5xl">Des recettes faciles à suivre en cuisinant.</h2>
          <p className="text-lg text-muted-foreground">
            Chaque étape affiche les ingrédients qu'elle utilise, avec leur quantité : tu n'as plus
            à remonter la liste les mains pleines de farine. Les minuteurs se lancent depuis
            l'étape.
          </p>
          <ul className="flex flex-col gap-3.5">
            <Point swatch="tomato">
              <strong>Ton assistant écrit la recette pour toi</strong>, à partir d'une idée, d'un
              lien ou de la photo d'un livre, et l'enregistre dans ta bibliothèque.
            </Point>
            <Point swatch="mustard">
              <strong>« Copier la recette »</strong> la met en texte pour l'envoyer à un proche.
            </Point>
          </ul>
        </div>
      </section>

      <section className="border-y bg-card py-16 ruled sm:py-24">
        <div className="page-width flex flex-col gap-10 sm:gap-14">
          <div className="flex max-w-2xl flex-col gap-4">
            <h2 className="text-4xl sm:text-5xl">Cuisiner à plusieurs, sur tous tes écrans.</h2>
            <p className="text-lg text-muted-foreground">
              Le mode cuisine affiche la recette en plein écran, une étape à la fois. Tes proches le
              rejoignent depuis leur téléphone en scannant un QR code, sans créer de compte. Quand
              quelqu'un change d'étape ou lance un minuteur, tous les écrans suivent.
            </p>
          </div>
          <CookingDevices />
        </div>
      </section>

      <section className="page-width flex flex-col gap-16 py-16 sm:gap-20 sm:py-24">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
          <AssistantChat />
          <div className="flex flex-col gap-5 lg:sticky lg:top-8">
            <h2 className="text-4xl sm:text-5xl">Ton assistant IA tient le stock avec toi.</h2>
            <p className="text-lg text-muted-foreground">
              Connecte Mon Garde-Manger à Claude ou à ChatGPT. L'assistant lit ton inventaire et tes
              recettes, et les met à jour quand tu le lui demandes, jusqu'à retirer du stock ce que
              tu viens de cuisiner.
            </p>
            <ul className="flex flex-col gap-3.5">
              <Point swatch="mustard">
                <strong>Au retour des courses</strong>, envoie-lui une photo : il ajoute les
                produits à ton garde-manger.
              </Point>
              <Point swatch="tomato">
                <strong>Pour le repas du soir</strong>, il propose une recette avec ce qui périme et
                l'enregistre si elle te plaît.
              </Point>
              <Point swatch="sage">
                <strong>Avant de faire les courses</strong>, il prépare ta liste à partir du stock
                bas et des recettes que tu veux faire.
              </Point>
              <Point swatch="cornflower">
                Tu l'autorises une fois, tu le révoques quand tu veux depuis ton compte.
              </Point>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <h2 className="text-4xl sm:text-5xl">Le brancher prend deux minutes.</h2>
          <ConnectorGuide mcpUrl={mcpUrl} />
        </div>
      </section>

      <section className="border-y bg-card py-16 sm:py-20">
        <div className="page-width grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <h2 className="text-4xl sm:text-5xl">Ce qui ne changera pas.</h2>
          <dl className="divide-y border-y">
            {[
              ['Prix', 'Gratuit'],
              ['Publicité et pistage', 'Aucun'],
              ['Hébergement', 'Allemagne, Union européenne'],
              ['Tes données', 'Supprimées depuis ton compte, en un clic'],
              ['Invités en cuisine', 'Sans compte'],
            ].map(([term, value]) => (
              <div key={term} className="flex justify-between gap-6 py-3.5">
                <dt className="font-semibold">{term}</dt>
                <dd className="text-right text-muted-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Faq />

      <section className="page-width flex flex-col items-start gap-6 border-t py-20 sm:py-28">
        <h2 className="max-w-3xl text-5xl leading-[0.98] sm:text-7xl">
          Commence par ce qui traîne dans ton frigo.
        </h2>
        <SignupActions />
      </section>
    </main>
  )
}
