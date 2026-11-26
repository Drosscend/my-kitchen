import { type JSONDataTypes } from '@adonisjs/core/types/transformers'
import { Head } from '@inertiajs/react'

export type SeoMeta = {
  title: string
  description: string
  canonical: string
  image: string
}

/**
 * The head of an indexed page, server rendered: title, description,
 * canonical URL and the Open Graph and Twitter cards.
 */
export function Seo({ meta }: { meta: SeoMeta }) {
  return (
    <Head>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={meta.canonical} />

      <meta property="og:site_name" content="Mon Garde-Manger" />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:title" content={`${meta.title} · Mon Garde-Manger`} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={meta.canonical} />
      <meta property="og:image" content={meta.image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${meta.title} · Mon Garde-Manger`} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />
    </Head>
  )
}

/**
 * One block of schema.org structured data in the head.
 */
export function JsonLd({ data }: { data: Record<string, JSONDataTypes> }) {
  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    </Head>
  )
}
