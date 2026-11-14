import type { RecipeView } from '#recipes/queries/recipe_query'

/**
 * The recipe of the cooking demo on the home page, frozen into the session
 * a visitor opens by sharing it.
 */
export const DEMO_RECIPE: RecipeView = {
  id: 'demo',
  title: 'Ratatouille au four',
  description: 'Les légumes du soleil confits lentement au four.',
  baseServings: 4,
  notes: null,
  ingredients: [
    { ref: 'aubergine', name: 'Aubergine', amount: 350, unit: 'g' },
    { ref: 'courgettes', name: 'Courgettes', amount: 300, unit: 'g' },
    { ref: 'poivrons', name: 'Poivrons rouges', amount: 300, unit: 'g' },
    { ref: 'tomates', name: 'Tomates', amount: 500, unit: 'g' },
    { ref: 'oignon', name: 'Oignons jaunes', amount: 150, unit: 'g' },
    { ref: 'ail', name: 'Ail', amount: 3, unit: 'gousses' },
    { ref: 'huile', name: 'Huile d’olive', amount: 5, unit: 'c. à s.' },
    { ref: 'herbes', name: 'Herbes de Provence', amount: 1, unit: 'c. à c.' },
    { ref: 'basilic', name: 'Basilic', amount: 6, unit: 'feuilles' },
  ],
  steps: [
    {
      ref: 'four',
      title: 'Four',
      content: 'Préchauffer le four à 200 °C, chaleur tournante.',
      timerSeconds: null,
    },
    {
      ref: 'aubergine',
      title: 'Aubergine',
      content: 'Couper {aubergine} en cubes de 2 cm, saler et laisser dégorger dans une passoire.',
      timerSeconds: 900,
    },
    {
      ref: 'legumes',
      title: 'Légumes',
      content: 'Couper {courgettes} et {poivrons} en cubes de la même taille.',
      timerSeconds: null,
    },
    {
      ref: 'tomates',
      title: 'Tomates',
      content:
        'Inciser {tomates} en croix, les plonger 30 secondes dans l’eau bouillante, puis les peler et les concasser.',
      timerSeconds: null,
    },
    {
      ref: 'aromates',
      title: 'Aromates',
      content: 'Émincer {oignon} et hacher {ail}.',
      timerSeconds: null,
    },
    {
      ref: 'revenir',
      title: 'À la poêle',
      content:
        'Faire revenir l’oignon et l’ail dans un filet d’huile, à feu moyen, jusqu’à ce qu’ils soient translucides.',
      timerSeconds: 300,
    },
    {
      ref: 'plat',
      title: 'Dans le plat',
      content:
        'Rincer et sécher l’aubergine, puis réunir tous les légumes dans un plat. Arroser de {huile} et parsemer d’{herbes}.',
      timerSeconds: null,
    },
    {
      ref: 'cuisson',
      title: 'Cuisson',
      content: 'Enfourner et remuer à mi-cuisson.',
      timerSeconds: 2700,
    },
    {
      ref: 'repos',
      title: 'Repos',
      content: 'Laisser reposer hors du four : les jus épaississent.',
      timerSeconds: 600,
    },
    {
      ref: 'service',
      title: 'Service',
      content: 'Parsemer de {basilic} ciselé et servir chaud, ou froid le lendemain.',
      timerSeconds: null,
    },
  ],
}
