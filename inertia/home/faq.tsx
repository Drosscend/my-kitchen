import { ChevronDownIcon } from 'lucide-react'
import { JsonLd } from '~/components/seo'

const questions = [
  {
    question: 'Mon Garde-Manger est-il vraiment gratuit ?',
    answer:
      'Oui. L’application est gratuite, sans publicité ni pistage, et il n’existe pas d’offre payante.',
  },
  {
    question: 'Faut-il installer une application ?',
    answer:
      'Non. Mon Garde-Manger s’ouvre dans le navigateur, sur ordinateur comme sur téléphone. Tu peux aussi l’ajouter à l’écran d’accueil de ton téléphone pour le lancer comme une application.',
  },
  {
    question: 'Quels assistants IA peut-on relier ?',
    answer:
      'Claude et ChatGPT. Tu ajoutes l’adresse du connecteur dans l’assistant, tu te connectes et tu autorises l’accès. Leurs offres gratuites suffisent.',
  },
  {
    question: 'Que peut faire l’assistant dans mon garde-manger ?',
    answer:
      'Il dispose de douze actions : lire l’inventaire et les recettes, ajouter, modifier ou retirer un ingrédient, retirer du stock ce qu’un plat a utilisé, et enregistrer, modifier ou supprimer une recette. Il ne voit que ton compte, et tu lui retires l’accès quand tu veux.',
  },
  {
    question: 'Quelle différence entre une DLC et une DDM ?',
    answer:
      'La DLC est une date limite de consommation : une fois dépassée, le produit est signalé comme périmé. La DDM est une date de durabilité minimale, « à consommer de préférence avant » : une fois dépassée, l’application t’invite seulement à vérifier le produit.',
  },
  {
    question: 'Comment suis-je prévenu avant qu’un produit périme ?',
    answer:
      'Ce qui périme en premier remonte en haut de l’inventaire. Le matin, tu reçois un e-mail lorsque des produits approchent de leur date ou l’ont dépassée, et la même alerte peut arriver en notification. Le nombre de jours d’avance se règle par catégorie depuis ton compte.',
  },
  {
    question: 'Mes proches doivent-ils créer un compte pour cuisiner avec moi ?',
    answer:
      'Non. Ils scannent le QR code du mode cuisine, ou saisissent son code à six chiffres, et suivent la recette sur leur téléphone. Les étapes et les minuteurs avancent sur tous les écrans.',
  },
  {
    question: 'Où sont stockées mes données ?',
    answer:
      'Sur un serveur en Allemagne, dans l’Union européenne. Tu les supprimes depuis ton compte, en un clic.',
  },
]

export function Faq() {
  return (
    <section className="page-width grid gap-10 py-16 sm:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          'mainEntity': questions.map(({ question, answer }) => ({
            '@type': 'Question',
            'name': question,
            'acceptedAnswer': { '@type': 'Answer', 'text': answer },
          })),
        }}
      />
      <h2 className="text-4xl sm:text-5xl">Questions fréquentes.</h2>
      <div className="divide-y border-y">
        {questions.map(({ question, answer }) => (
          <details key={question} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
              {question}
              <ChevronDownIcon className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <p className="max-w-2xl pb-5 text-muted-foreground">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
