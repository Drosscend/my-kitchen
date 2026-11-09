import { Link } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { type ReactNode, useEffect } from 'react'
import { Page, PageHeader } from '~/components/page'

const CONTACT_EMAIL = 'contact@kevin-dev.com'

function Section({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 space-y-3 border-t pt-8 first:border-t-0 first:pt-0">
      <h2 className="text-2xl">{title}</h2>
      {children}
    </section>
  )
}

function Subsection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2 pt-3">
      <h3 className="text-lg">{title}</h3>
      {children}
    </div>
  )
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-primary hover:underline"
    >
      {children}
    </a>
  )
}

function Contact() {
  return (
    <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-primary hover:underline">
      {CONTACT_EMAIL}
    </a>
  )
}

export default function Legal() {
  /**
   * The page renders after the browser looked for the anchor: links such as
   * /legal#conditions scroll once the sections exist.
   */
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))

    if (id) {
      document.getElementById(id)?.scrollIntoView()
    }
  }, [])

  return (
    <>
      <Head title="Mentions légales" />
      <Page>
        <PageHeader title="Mentions légales" meta="Mise à jour le 9 novembre 2026" />

        <div className="max-w-3xl space-y-8 text-sm leading-relaxed">
          <Section title="Éditeur du site">
            <p>
              Mon Garde-Manger est édité à titre personnel par Kévin Véronési, également directeur
              de la publication.
            </p>
            <p>
              Contact : <Contact />
            </p>
          </Section>

          <Section title="Hébergement">
            <p>
              Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Allemagne. Téléphone : +49
              (0)9831 505-0.
            </p>
            <p>Les données sont hébergées dans l'Union européenne.</p>
          </Section>

          <Section title="Propriété intellectuelle">
            <p>
              Le code, les textes et les visuels du site appartiennent à Kévin Véronési, sauf
              mention contraire. Toute reproduction demande son accord préalable.
            </p>
            <p>
              L'inventaire et les recettes que tu saisis restent les tiens : ils ne servent qu'à te
              rendre le service.
            </p>
          </Section>

          <Section id="conditions" title="Conditions d'utilisation">
            <p>
              Mon Garde-Manger est un service gratuit. Créer un compte, y compris avec Google, vaut
              acceptation des conditions ci-dessous.
            </p>

            <Subsection title="Service">
              <p>
                Le service est fourni tel quel, sans garantie de disponibilité ni d'absence
                d'erreur. L'éditeur peut le faire évoluer, l'interrompre pour maintenance ou y
                mettre fin. En cas d'arrêt définitif, il préviendra par e-mail dans la mesure du
                possible, pour te laisser le temps de récupérer tes données.
              </p>
            </Subsection>

            <Subsection title="Compte">
              <p>
                Un compte demande une adresse e-mail valide dont tu es titulaire. Tu es responsable
                de la confidentialité de ton mot de passe et de ce qui est fait avec ton compte, y
                compris par les assistants que tu autorises à y accéder.
              </p>
            </Subsection>

            <Subsection title="Usage acceptable">
              <p>Le service est destiné à un usage personnel. Il est interdit :</p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>de tenter d'accéder aux données d'un autre compte ;</li>
                <li>
                  de perturber le service, de contourner ses protections ou de l'interroger de
                  manière automatisée et abusive ;
                </li>
                <li>d'y enregistrer des contenus illicites.</li>
              </ul>
              <p>
                Une session de cuisine partagée est visible par toute personne qui connaît son code
                : n'y mets rien de confidentiel.
              </p>
            </Subsection>

            <Subsection title="Dates de péremption et recettes">
              <p>
                Les alertes de péremption, les seuils de stock et les conversions d'unités sont
                indicatifs : ils sont calculés à partir de ce que tu saisis et ne remplacent ni
                l'emballage ni ton propre jugement. Il en va de même des recettes, y compris celles
                écrites par un assistant. Vérifie toujours l'état d'un aliment avant de le
                consommer.
              </p>
            </Subsection>

            <Subsection title="Responsabilité">
              <p>
                L'éditeur ne saurait être tenu responsable d'une indisponibilité du service, d'une
                perte de données ou des conséquences d'une information erronée. Pense à copier ton
                inventaire si tu y tiens.
              </p>
            </Subsection>

            <Subsection title="Suspension et suppression">
              <p>
                L'éditeur peut suspendre ou supprimer un compte qui ne respecte pas ces conditions.
                Tu peux supprimer le tien à tout moment depuis la page compte.
              </p>
            </Subsection>

            <Subsection title="Modifications et droit applicable">
              <p>
                Ces conditions peuvent évoluer : la date de mise à jour figure en haut de la page.
                Elles sont soumises au droit français.
              </p>
            </Subsection>
          </Section>

          <Section id="confidentialite" title="Données personnelles">
            <p>
              Le responsable du traitement est Kévin Véronési. Les données ne servent qu'à faire
              fonctionner l'application : elles ne sont ni vendues, ni utilisées à des fins
              publicitaires, ni transférées hors de l'Union européenne, sauf vers les services que
              tu choisis toi-même d'utiliser (Google, assistants connectés).
            </p>

            <Subsection title="Compte">
              <p>
                Ton compte conserve ton adresse e-mail, ton prénom si tu le renseignes et ton mot de
                passe, enregistré sous forme hachée et jamais en clair. Ces données sont nécessaires
                au service que tu demandes en créant un compte.
              </p>
            </Subsection>

            <Subsection title="Inventaire et recettes">
              <p>
                Les ingrédients, leurs lots et dates de péremption, ainsi que tes recettes, sont
                rattachés à ton compte. Personne d'autre n'y a accès, sauf ce que tu partages
                toi-même en mode cuisine.
              </p>
            </Subsection>

            <Subsection title="Mode cuisine partagé">
              <p>
                Lancer une session de cuisine crée une copie de la recette, consultable sans compte
                par toute personne qui connaît son code à six chiffres. Elle cesse d'être accessible
                six heures après sa dernière modification, puis est supprimée.
              </p>
            </Subsection>

            <Subsection title="Connexion avec Google">
              <p>
                Si tu choisis de te connecter avec Google, Google transmet ton nom, ton adresse
                e-mail, l'indication qu'elle est vérifiée et ton identifiant Google. Seuls ton
                adresse, ton prénom et cet identifiant sont conservés, pour te reconnaître aux
                connexions suivantes. L'application ne reçoit jamais ton mot de passe Google et
                n'accède à aucune autre donnée de ton compte Google. Google traite ces informations
                selon sa{' '}
                <ExternalLink href="https://policies.google.com/privacy">
                  politique de confidentialité
                </ExternalLink>
                .
              </p>
            </Subsection>

            <Subsection title="Assistants connectés">
              <p>
                Quand tu autorises un assistant (Claude, ChatGPT…) sur la page de consentement, il
                peut lire et modifier ton inventaire et tes recettes en ton nom. L'application garde
                cette autorisation, le nom de l'assistant, ses dates d'autorisation et de dernière
                utilisation, et ses jetons sous forme hachée. Ce que l'assistant lit est ensuite
                traité par son éditeur, selon sa propre politique de confidentialité, parfois hors
                de l'Union européenne. Tu peux révoquer cet accès à tout moment depuis ton compte.
              </p>
            </Subsection>

            <Subsection title="E-mails">
              <p>
                Ton adresse ne sert qu'aux e-mails liés à ton compte : confirmation d'adresse et
                réinitialisation du mot de passe. Aucune lettre d'information ni aucun message
                commercial ne t'est envoyé.
              </p>
            </Subsection>

            <Subsection title="Sécurité">
              <p>
                Pour limiter les abus, ton adresse IP sert à compter les tentatives de connexion,
                d'inscription et d'envoi d'e-mails. Ce compte reste en mémoire, n'est jamais
                enregistré en base et s'efface au bout d'une heure au plus.
              </p>
            </Subsection>

            <Subsection title="Mesure d'audience">
              <p>
                Le site mesure son audience avec{' '}
                <ExternalLink href="https://umami.is">Umami</ExternalLink>, hébergé par l'éditeur.
                Umami ne dépose aucun cookie et ne collecte aucune donnée personnelle : les
                statistiques sont anonymes et agrégées, aucun consentement n'est donc nécessaire.
              </p>
            </Subsection>

            <Subsection title="Cookies">
              <p>
                Le site n'utilise aucun cookie publicitaire ou de suivi. Il ne dépose que des
                cookies techniques, indispensables à son fonctionnement et exemptés de consentement
                :
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  <code>adonis-session</code> garde ta session ouverte, pendant 30 jours ;
                </li>
                <li>
                  <code>XSRF-TOKEN</code> protège les formulaires contre la falsification de
                  requêtes ;
                </li>
                <li>
                  <code>google_oauth_state</code> sécurise la connexion avec Google et disparaît à
                  ton retour sur le site ;
                </li>
                <li>
                  les cookies du serveur d'autorisation, sous <code>/oauth</code>, le temps
                  d'autoriser un assistant.
                </li>
              </ul>
            </Subsection>

            <Subsection title="Durées de conservation">
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  Compte, inventaire et recettes : tant que le compte existe. Le supprimer depuis la
                  page compte efface tout immédiatement et définitivement.
                </li>
                <li>
                  Liens de confirmation d'adresse : 24 heures. Liens de réinitialisation du mot de
                  passe : 1 heure.
                </li>
                <li>Sessions de cuisine partagées : 6 heures après leur dernière modification.</li>
                <li>
                  Accès des assistants : jusqu'à leur révocation, un an au plus. Un accès inutilisé
                  pendant 30 jours expire de lui-même.
                </li>
              </ul>
            </Subsection>

            <Subsection title="Tes droits">
              <p>
                Tu disposes d'un droit d'accès, de rectification, d'effacement, de portabilité,
                d'opposition et de limitation sur tes données. La plupart s'exercent directement
                dans l'application : modifier ton prénom ou ton adresse et supprimer ton compte
                depuis la page{' '}
                <Link route="account.show" className="font-medium text-primary hover:underline">
                  Mon compte
                </Link>
                , copier ton inventaire au format Markdown depuis l'inventaire. Pour le reste, écris
                à <Contact />.
              </p>
              <p>
                Tu peux aussi adresser une réclamation à la{' '}
                <ExternalLink href="https://www.cnil.fr">CNIL</ExternalLink>.
              </p>
            </Subsection>
          </Section>
        </div>
      </Page>
    </>
  )
}
