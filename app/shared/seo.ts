import { appUrl } from '#config/app'

/**
 * The tags of a page search engines index, rendered by the `Seo`
 * component. A page that carries none is marked noindex by the layout.
 */
export function seo(path: string, title: string, description: string) {
  return {
    title,
    description,
    canonical: new URL(path, appUrl).href,
    image: new URL('/og.png', appUrl).href,
  }
}
