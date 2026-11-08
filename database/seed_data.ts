import type { IngredientCategory, IngredientState, IngredientUnit } from '#inventory/domain/catalog'
import type { RecipeContentInput } from '#recipes/domain/recipe'

/**
 * A batch expires `inDays` days from the seed date, or never when null.
 */
export interface SeedBatch {
  quantity: number
  inDays: number | null
}

interface SeedIngredient {
  name: string
  category: IngredientCategory
  unit: IngredientUnit
  state: IngredientState
  batches: SeedBatch[]
}

function ingredient(
  name: string,
  category: IngredientCategory,
  unit: IngredientUnit,
  batches: [quantity: number, inDays: number | null][],
  state: IngredientState = 'fresh'
): SeedIngredient {
  return {
    name,
    category,
    unit,
    state,
    batches: batches.map(([quantity, inDays]) => ({ quantity, inDays })),
  }
}

export const SEED_INGREDIENTS: SeedIngredient[] = [
  ingredient('Carottes', 'vegetables', 'g', [[1000, 9]]),
  ingredient('Pommes de terre', 'vegetables', 'kg', [[2.5, 21]]),
  ingredient('Oignons jaunes', 'vegetables', 'g', [[900, 30]]),
  ingredient('Échalotes', 'vegetables', 'g', [[250, 25]]),
  ingredient('Ail', 'vegetables', 'g', [[120, 40]]),
  ingredient('Courgettes', 'vegetables', 'g', [[300, -1]]),
  ingredient('Tomates', 'vegetables', 'g', [
    [500, 1],
    [250, 5],
  ]),
  ingredient('Poivrons rouges', 'vegetables', 'g', [[450, 4]]),
  ingredient('Aubergine', 'vegetables', 'g', [[350, 2]]),
  ingredient('Poireaux', 'vegetables', 'g', [[600, 6]]),
  ingredient('Brocoli', 'vegetables', 'g', [[400, 3]]),
  ingredient('Épinards frais', 'vegetables', 'g', [[150, 1]]),
  ingredient('Champignons de Paris', 'vegetables', 'g', [[250, 0]]),
  ingredient('Salade batavia', 'vegetables', 'g', [[300, 2]]),
  ingredient('Concombre', 'vegetables', 'g', [[350, 5]]),
  ingredient('Céleri branche', 'vegetables', 'g', [[400, 8]]),
  ingredient('Haricots verts', 'vegetables', 'g', [[600, 180]], 'frozen'),
  ingredient('Petits pois', 'vegetables', 'g', [[450, 200]], 'frozen'),
  ingredient('Butternut', 'vegetables', 'kg', [[1.2, 45]]),
  ingredient('Radis', 'vegetables', 'g', []),
  ingredient('Chou-fleur', 'vegetables', 'g', [[800, 7]]),
  ingredient('Patate douce', 'vegetables', 'g', [[700, 18]]),
  ingredient('Persil plat', 'vegetables', 'g', [[40, 3]]),
  ingredient('Menthe fraîche', 'vegetables', 'g', [[25, 2]]),

  ingredient('Pommes', 'fruits', 'kg', [[1.5, 20]]),
  ingredient('Bananes', 'fruits', 'g', [[600, 2]]),
  ingredient('Citrons jaunes', 'fruits', 'g', [[400, 15]]),
  ingredient('Citrons verts', 'fruits', 'g', [[150, 12]]),
  ingredient('Oranges', 'fruits', 'kg', [[1, 14]]),
  ingredient('Fraises', 'fruits', 'g', [[250, -2]]),
  ingredient('Avocats', 'fruits', 'g', [[400, 1]]),
  ingredient('Poires', 'fruits', 'g', [[500, 6]]),
  ingredient('Framboises', 'fruits', 'g', [[300, 240]], 'frozen'),
  ingredient('Raisins secs', 'fruits', 'g', [[120, 150]]),
  ingredient('Kiwis', 'fruits', 'g', [[450, 10]]),
  ingredient('Mangue', 'fruits', 'g', []),

  ingredient('Cuisses de poulet', 'meat', 'g', [[1200, 90]], 'frozen'),
  ingredient('Blancs de poulet', 'meat', 'g', [[500, 2]]),
  ingredient(
    'Bœuf haché',
    'meat',
    'g',
    [
      [500, 60],
      [500, 75],
    ],
    'frozen'
  ),
  ingredient('Lardons fumés', 'meat', 'g', [[200, 4]]),
  ingredient('Jambon blanc', 'meat', 'g', [[160, 3]]),
  ingredient('Saucisses de Toulouse', 'meat', 'g', [[600, 120]], 'frozen'),
  ingredient('Côtes de porc', 'meat', 'g', [[600, -1]]),
  ingredient('Chorizo', 'meat', 'g', [[150, 25]]),
  ingredient('Paleron de bœuf', 'meat', 'g', [[800, 150]], 'frozen'),

  ingredient('Filets de cabillaud', 'fish', 'g', [[400, 150]], 'frozen'),
  ingredient('Pavés de saumon', 'fish', 'g', [[300, 1]]),
  ingredient('Crevettes décortiquées', 'fish', 'g', [[250, 100]], 'frozen'),
  ingredient('Thon au naturel', 'fish', 'g', [[420, 600]]),
  ingredient('Sardines à l’huile', 'fish', 'g', [[135, 500]]),

  ingredient('Lait demi-écrémé', 'dairy', 'L', [
    [1, 5],
    [1, 12],
  ]),
  ingredient('Beurre doux', 'dairy', 'g', [
    [250, 20],
    [250, 35],
  ]),
  ingredient('Crème fraîche épaisse', 'dairy', 'mL', [[200, 3]]),
  ingredient('Yaourts nature', 'dairy', 'g', [[500, 6]]),
  ingredient('Comté', 'dairy', 'g', [[350, 25]]),
  ingredient('Parmesan', 'dairy', 'g', [[180, 40]]),
  ingredient('Mozzarella', 'dairy', 'g', [[125, -1]]),
  ingredient('Emmental râpé', 'dairy', 'g', [[400, 2]]),
  ingredient('Feta', 'dairy', 'g', [[200, 10]]),
  ingredient('Mascarpone', 'dairy', 'g', [[250, 8]]),
  ingredient('Fromage de chèvre', 'dairy', 'g', [[150, 4]]),
  ingredient('Crème liquide entière', 'dairy', 'mL', [[500, 9]]),

  ingredient('Cumin moulu', 'spices', 'g', [[40, -60]]),
  ingredient('Paprika fumé', 'spices', 'g', [[80, 200]]),
  ingredient('Curry en poudre', 'spices', 'g', [[60, 20]]),
  ingredient('Cannelle', 'spices', 'g', [[45, 300]]),
  ingredient('Poivre noir en grains', 'spices', 'g', [[100, 400]]),
  ingredient('Sel fin', 'spices', 'kg', [[1, null]]),
  ingredient('Fleur de sel', 'spices', 'g', [[250, null]]),
  ingredient('Herbes de Provence', 'spices', 'g', [[30, 90]]),
  ingredient('Curcuma', 'spices', 'g', [[70, -10]]),
  ingredient('Piment d’Espelette', 'spices', 'g', [[50, 180]]),
  ingredient('Thym séché', 'spices', 'g', [[20, 240]]),
  ingredient('Gingembre frais', 'spices', 'g', [[100, 12]]),
  ingredient('Noix de muscade', 'spices', 'g', [[60, 500]]),
  ingredient('Laurier', 'spices', 'g', [[15, 365]]),
  ingredient('Graines de coriandre', 'spices', 'g', []),
  ingredient('Garam masala', 'spices', 'g', [[55, 150]]),

  ingredient('Riz basmati', 'starches', 'kg', [[2, 300]]),
  ingredient('Pâtes penne', 'starches', 'g', [
    [500, 200],
    [500, 260],
  ]),
  ingredient('Spaghetti', 'starches', 'g', [[350, 180]]),
  ingredient('Farine T55', 'starches', 'kg', [[1.5, 120]]),
  ingredient('Semoule fine', 'starches', 'g', [[600, 10]]),
  ingredient('Lentilles corail', 'starches', 'g', [[800, 400]]),
  ingredient('Pois chiches', 'starches', 'g', [[500, 365]]),
  ingredient('Quinoa', 'starches', 'g', [[300, -20]]),
  ingredient('Pain de mie', 'starches', 'g', [[400, 4]]),
  ingredient('Flocons d’avoine', 'starches', 'g', [[750, 150]]),
  ingredient('Riz arborio', 'starches', 'kg', [[1, 280]]),
  ingredient('Tagliatelles fraîches', 'starches', 'g', [[250, 2]]),
  ingredient('Polenta', 'starches', 'g', []),
  ingredient('Chapelure', 'starches', 'g', [[200, 90]]),
  ingredient('Pâte brisée', 'starches', 'g', [[230, 6]]),

  ingredient('Huile d’olive', 'other', 'L', [[0.75, 400]]),
  ingredient('Huile de tournesol', 'other', 'L', [[1, 300]]),
  ingredient('Vinaigre balsamique', 'other', 'mL', [[250, null]]),
  ingredient('Moutarde de Dijon', 'other', 'g', [[200, 60]]),
  ingredient('Sucre en poudre', 'other', 'kg', [[1, null]]),
  ingredient('Sucre roux', 'other', 'g', [[500, null]]),
  ingredient('Miel', 'other', 'g', [[350, null]]),
  ingredient('Chocolat noir 70 %', 'other', 'g', [[200, 120]]),
  ingredient('Levure chimique', 'other', 'g', [[40, 200]]),
  ingredient('Bouillon de volaille', 'other', 'g', [[80, 180]]),
  ingredient('Concentré de tomates', 'other', 'g', [[140, 5]]),
  ingredient('Tomates pelées', 'other', 'g', [[800, 500]]),
  ingredient('Lait de coco', 'other', 'mL', [[400, 365]]),
  ingredient('Sauce soja', 'other', 'mL', [[150, 250]]),
  ingredient('Œufs', 'other', 'piece', [
    [6, 9],
    [6, 20],
  ]),
  ingredient('Confiture d’abricots', 'other', 'g', [[370, 200]]),
  ingredient('Café moulu', 'other', 'g', [[250, 90]]),
  ingredient('Thé noir', 'other', 'g', [[60, 300]]),
  ingredient('Amandes effilées', 'other', 'g', [[100, 120]]),
  ingredient('Noix de cajou', 'other', 'g', []),
  ingredient('Pesto', 'other', 'g', [[190, -3]]),
]

export const SEED_RECIPES: RecipeContentInput[] = [
  {
    title: 'Ratatouille au four',
    description: 'Les légumes du soleil confits lentement au four.',
    baseServings: 4,
    ingredients: [
      { ref: 'aubergine', name: 'Aubergine', amount: 350, unit: 'g' },
      { ref: 'courgettes', name: 'Courgettes', amount: 300, unit: 'g' },
      { ref: 'poivrons', name: 'Poivrons rouges', amount: 300, unit: 'g' },
      { ref: 'tomates', name: 'Tomates', amount: 500, unit: 'g' },
      { ref: 'oignon', name: 'Oignons jaunes', amount: 150, unit: 'g' },
      { ref: 'ail', name: 'Ail', amount: 2, unit: 'gousses' },
      { ref: 'huile', name: 'Huile d’olive', amount: 4, unit: 'c. à s.' },
      { ref: 'herbes', name: 'Herbes de Provence', amount: 1, unit: 'c. à c.' },
    ],
    steps: [
      {
        ref: 'couper',
        content: 'Couper {aubergine}, {courgettes} et {poivrons} en cubes de 2 cm.',
      },
      {
        ref: 'melanger',
        content:
          'Émincer {oignon} et {ail}, mélanger avec les légumes et {tomates} dans un plat, arroser de {huile} et parsemer d’{herbes}.',
      },
      {
        ref: 'cuire',
        content: 'Enfourner à 200 °C en remuant à mi-cuisson. {timer}',
        timerSeconds: 2700,
      },
    ],
  },
  {
    title: 'Risotto aux champignons',
    baseServings: 4,
    notes: 'Servir **tout de suite**, le risotto n’attend pas.',
    ingredients: [
      { ref: 'riz', name: 'Riz arborio', amount: 320, unit: 'g' },
      { ref: 'champignons', name: 'Champignons de Paris', amount: 250, unit: 'g' },
      { ref: 'echalotes', name: 'Échalotes', amount: 2, unit: null },
      { ref: 'bouillon', name: 'Bouillon de volaille', amount: 1, unit: 'L' },
      { ref: 'parmesan', name: 'Parmesan', amount: 60, unit: 'g' },
      { ref: 'beurre', name: 'Beurre doux', amount: 30, unit: 'g' },
    ],
    steps: [
      {
        ref: 'revenir',
        content: 'Faire revenir {echalotes} émincées et {champignons} dans la moitié du {beurre}.',
      },
      {
        ref: 'nacrer',
        content: 'Ajouter {riz} et remuer jusqu’à ce qu’il devienne translucide.',
        timerSeconds: 120,
      },
      {
        ref: 'mouiller',
        content: 'Verser {bouillon} chaud louche par louche, en remuant souvent. {timer}',
        timerSeconds: 1080,
      },
      {
        ref: 'lier',
        content: 'Hors du feu, incorporer {parmesan} et le reste du {beurre}.',
      },
    ],
  },
  {
    title: 'Poulet au curry et lait de coco',
    baseServings: 4,
    ingredients: [
      { ref: 'poulet', name: 'Blancs de poulet', amount: 500, unit: 'g' },
      { ref: 'coco', name: 'Lait de coco', amount: 400, unit: 'mL' },
      { ref: 'curry', name: 'Curry en poudre', amount: 2, unit: 'c. à s.' },
      { ref: 'oignon', name: 'Oignons jaunes', amount: 150, unit: 'g' },
      { ref: 'gingembre', name: 'Gingembre frais', amount: 20, unit: 'g' },
      { ref: 'riz', name: 'Riz basmati', amount: 300, unit: 'g' },
    ],
    steps: [
      {
        ref: 'dorer',
        content: 'Faire dorer {oignon} émincé et {gingembre} râpé, puis {poulet} en morceaux.',
      },
      {
        ref: 'mijoter',
        content: 'Saupoudrer de {curry}, verser {coco} et laisser mijoter. {timer}',
        timerSeconds: 1200,
      },
      {
        ref: 'riz',
        content: 'Pendant ce temps, cuire {riz} dans deux fois son volume d’eau. {timer}',
        timerSeconds: 660,
      },
    ],
  },
  {
    title: 'Gratin dauphinois',
    baseServings: 6,
    ingredients: [
      { ref: 'pdt', name: 'Pommes de terre', amount: 1.2, unit: 'kg' },
      { ref: 'creme', name: 'Crème liquide entière', amount: 400, unit: 'mL' },
      { ref: 'lait', name: 'Lait demi-écrémé', amount: 400, unit: 'mL' },
      { ref: 'ail', name: 'Ail', amount: 1, unit: 'gousse' },
      { ref: 'muscade', name: 'Noix de muscade', amount: null, unit: null },
    ],
    steps: [
      {
        ref: 'trancher',
        content: 'Éplucher {pdt} et les trancher finement, sans les laver.',
      },
      {
        ref: 'chauffer',
        content:
          'Porter {lait} et {creme} à frémissement avec {ail} écrasé et un peu de {muscade}, y cuire les tranches. {timer}',
        timerSeconds: 600,
      },
      {
        ref: 'gratiner',
        content: 'Verser dans un plat beurré et enfourner à 160 °C. {timer}',
        timerSeconds: 4200,
      },
    ],
  },
  {
    title: 'Soupe poireaux pommes de terre',
    baseServings: 4,
    ingredients: [
      { ref: 'poireaux', name: 'Poireaux', amount: 600, unit: 'g' },
      { ref: 'pdt', name: 'Pommes de terre', amount: 400, unit: 'g' },
      { ref: 'beurre', name: 'Beurre doux', amount: 20, unit: 'g' },
      { ref: 'creme', name: 'Crème fraîche épaisse', amount: 2, unit: 'c. à s.' },
    ],
    steps: [
      { ref: 'suer', content: 'Faire suer {poireaux} émincés dans {beurre}.' },
      {
        ref: 'cuire',
        content: 'Ajouter {pdt} en cubes, couvrir d’eau salée et cuire. {timer}',
        timerSeconds: 1500,
      },
      { ref: 'mixer', content: 'Mixer et servir avec {creme}.' },
    ],
  },
  {
    title: 'Spaghetti bolognaise',
    baseServings: 4,
    ingredients: [
      { ref: 'spaghetti', name: 'Spaghetti', amount: 350, unit: 'g' },
      { ref: 'boeuf', name: 'Bœuf haché', amount: 400, unit: 'g' },
      { ref: 'tomates', name: 'Tomates pelées', amount: 400, unit: 'g' },
      { ref: 'concentre', name: 'Concentré de tomates', amount: 1, unit: 'c. à s.' },
      { ref: 'carotte', name: 'Carottes', amount: 100, unit: 'g' },
      { ref: 'oignon', name: 'Oignons jaunes', amount: 100, unit: 'g' },
      { ref: 'parmesan', name: 'Parmesan', amount: 40, unit: 'g' },
    ],
    steps: [
      {
        ref: 'base',
        content: 'Faire revenir {oignon} et {carotte} hachés, puis {boeuf} jusqu’à coloration.',
      },
      {
        ref: 'sauce',
        content: 'Ajouter {tomates} et {concentre}, laisser mijoter à couvert. {timer}',
        timerSeconds: 2400,
      },
      {
        ref: 'pates',
        content: 'Cuire {spaghetti} al dente et servir avec la sauce et {parmesan}. {timer}',
        timerSeconds: 540,
      },
    ],
  },
  {
    title: 'Quiche lorraine',
    baseServings: 6,
    ingredients: [
      { ref: 'pate', name: 'Pâte brisée', amount: 1, unit: 'rouleau' },
      { ref: 'lardons', name: 'Lardons fumés', amount: 200, unit: 'g' },
      { ref: 'oeufs', name: 'Œufs', amount: 3, unit: null },
      { ref: 'creme', name: 'Crème liquide entière', amount: 250, unit: 'mL' },
      { ref: 'lait', name: 'Lait demi-écrémé', amount: 100, unit: 'mL' },
      { ref: 'muscade', name: 'Noix de muscade', amount: null, unit: null },
    ],
    steps: [
      { ref: 'foncer', content: 'Foncer un moule avec {pate} et la piquer à la fourchette.' },
      { ref: 'lardons', content: 'Faire rissoler {lardons} à sec et les répartir sur la pâte.' },
      {
        ref: 'appareil',
        content: 'Battre {oeufs}, {creme}, {lait} et un peu de {muscade}, puis verser.',
      },
      {
        ref: 'cuire',
        content: 'Cuire à 180 °C jusqu’à ce que la quiche soit dorée. {timer}',
        timerSeconds: 2100,
      },
    ],
  },
  {
    title: 'Dahl de lentilles corail',
    baseServings: 4,
    ingredients: [
      { ref: 'lentilles', name: 'Lentilles corail', amount: 250, unit: 'g' },
      { ref: 'coco', name: 'Lait de coco', amount: 200, unit: 'mL' },
      { ref: 'tomates', name: 'Tomates pelées', amount: 400, unit: 'g' },
      { ref: 'oignon', name: 'Oignons jaunes', amount: 100, unit: 'g' },
      { ref: 'garam', name: 'Garam masala', amount: 2, unit: 'c. à c.' },
      { ref: 'curcuma', name: 'Curcuma', amount: 1, unit: 'c. à c.' },
      { ref: 'citron', name: 'Citrons verts', amount: 1, unit: null },
    ],
    steps: [
      {
        ref: 'epices',
        content: 'Faire revenir {oignon} avec {garam} et {curcuma}.',
      },
      {
        ref: 'cuire',
        content: 'Ajouter {lentilles} rincées, {tomates}, {coco} et 300 mL d’eau. {timer}',
        timerSeconds: 1200,
      },
      { ref: 'finir', content: 'Rectifier l’assaisonnement et arroser du jus de {citron}.' },
    ],
  },
  {
    title: 'Saumon en papillote',
    baseServings: 2,
    ingredients: [
      { ref: 'saumon', name: 'Pavés de saumon', amount: 2, unit: null },
      { ref: 'citron', name: 'Citrons jaunes', amount: 1, unit: null },
      { ref: 'courgette', name: 'Courgettes', amount: 150, unit: 'g' },
      { ref: 'huile', name: 'Huile d’olive', amount: 1, unit: 'c. à s.' },
      { ref: 'riz', name: 'Riz basmati', amount: 150, unit: 'g' },
    ],
    steps: [
      {
        ref: 'papillote',
        content:
          'Poser {saumon} sur du papier cuisson avec {courgette} en rubans, des rondelles de {citron} et {huile}.',
      },
      {
        ref: 'cuire',
        content: 'Fermer les papillotes et cuire à 200 °C. {timer}',
        timerSeconds: 900,
      },
      { ref: 'riz', content: 'Servir avec {riz} cuit à l’eau.', timerSeconds: 660 },
    ],
  },
  {
    title: 'Crêpes',
    baseServings: 4,
    notes: 'La pâte se garde **24 h** au frais.',
    ingredients: [
      { ref: 'farine', name: 'Farine T55', amount: 250, unit: 'g' },
      { ref: 'oeufs', name: 'Œufs', amount: 4, unit: null },
      { ref: 'lait', name: 'Lait demi-écrémé', amount: 500, unit: 'mL' },
      { ref: 'sucre', name: 'Sucre en poudre', amount: 30, unit: 'g' },
      { ref: 'beurre', name: 'Beurre doux', amount: 50, unit: 'g' },
    ],
    steps: [
      {
        ref: 'pate',
        content:
          'Fouetter {farine}, {sucre} et {oeufs}, puis délayer avec {lait} et {beurre} fondu.',
      },
      { ref: 'repos', content: 'Laisser reposer la pâte. {timer}', timerSeconds: 3600 },
      { ref: 'cuire', content: 'Cuire les crêpes une à une dans une poêle bien chaude.' },
    ],
  },
  {
    title: 'Salade de pois chiches et feta',
    baseServings: 2,
    ingredients: [
      { ref: 'poischiches', name: 'Pois chiches', amount: 250, unit: 'g' },
      { ref: 'feta', name: 'Feta', amount: 100, unit: 'g' },
      { ref: 'concombre', name: 'Concombre', amount: 200, unit: 'g' },
      { ref: 'tomates', name: 'Tomates', amount: 200, unit: 'g' },
      { ref: 'menthe', name: 'Menthe fraîche', amount: 10, unit: 'g' },
      { ref: 'citron', name: 'Citrons jaunes', amount: 1, unit: null },
      { ref: 'huile', name: 'Huile d’olive', amount: 2, unit: 'c. à s.' },
    ],
    steps: [
      {
        ref: 'couper',
        content: 'Couper {concombre}, {tomates} et {feta} en dés, ciseler {menthe}.',
      },
      {
        ref: 'assembler',
        content: 'Mélanger avec {poischiches} cuits, le jus de {citron} et {huile}.',
      },
    ],
  },
  {
    title: 'Omelette aux champignons',
    baseServings: 2,
    ingredients: [
      { ref: 'oeufs', name: 'Œufs', amount: 4, unit: null },
      { ref: 'champignons', name: 'Champignons de Paris', amount: 150, unit: 'g' },
      { ref: 'persil', name: 'Persil plat', amount: 5, unit: 'g' },
      { ref: 'beurre', name: 'Beurre doux', amount: 15, unit: 'g' },
    ],
    steps: [
      {
        ref: 'champignons',
        content: 'Poêler {champignons} émincés dans {beurre}. {timer}',
        timerSeconds: 300,
      },
      {
        ref: 'omelette',
        content: 'Verser {oeufs} battus avec {persil} haché et cuire à feu doux.',
      },
    ],
  },
  {
    title: 'Fondant au chocolat',
    baseServings: 8,
    ingredients: [
      { ref: 'chocolat', name: 'Chocolat noir 70 %', amount: 200, unit: 'g' },
      { ref: 'beurre', name: 'Beurre doux', amount: 150, unit: 'g' },
      { ref: 'sucre', name: 'Sucre en poudre', amount: 120, unit: 'g' },
      { ref: 'oeufs', name: 'Œufs', amount: 4, unit: null },
      { ref: 'farine', name: 'Farine T55', amount: 50, unit: 'g' },
    ],
    steps: [
      { ref: 'fondre', content: 'Faire fondre {chocolat} et {beurre} au bain-marie.' },
      {
        ref: 'melanger',
        content: 'Fouetter {oeufs} et {sucre}, ajouter le chocolat puis {farine}.',
      },
      {
        ref: 'cuire',
        content: 'Cuire à 180 °C, le cœur doit rester tremblant. {timer}',
        timerSeconds: 1320,
      },
    ],
  },
  {
    title: 'Velouté de butternut',
    baseServings: 4,
    ingredients: [
      { ref: 'butternut', name: 'Butternut', amount: 1, unit: 'kg' },
      { ref: 'oignon', name: 'Oignons jaunes', amount: 100, unit: 'g' },
      { ref: 'coco', name: 'Lait de coco', amount: 200, unit: 'mL' },
      { ref: 'gingembre', name: 'Gingembre frais', amount: 10, unit: 'g' },
    ],
    steps: [
      {
        ref: 'revenir',
        content: 'Faire revenir {oignon} et {gingembre}, ajouter {butternut} en cubes.',
      },
      {
        ref: 'cuire',
        content: 'Couvrir d’eau et cuire jusqu’à ce que la courge soit tendre. {timer}',
        timerSeconds: 1500,
      },
      { ref: 'mixer', content: 'Mixer avec {coco} jusqu’à obtenir un velouté lisse.' },
    ],
  },
  {
    title: 'Chili con carne',
    baseServings: 6,
    ingredients: [
      { ref: 'boeuf', name: 'Bœuf haché', amount: 500, unit: 'g' },
      { ref: 'tomates', name: 'Tomates pelées', amount: 800, unit: 'g' },
      { ref: 'poivron', name: 'Poivrons rouges', amount: 150, unit: 'g' },
      { ref: 'oignon', name: 'Oignons jaunes', amount: 150, unit: 'g' },
      { ref: 'cumin', name: 'Cumin moulu', amount: 2, unit: 'c. à c.' },
      { ref: 'paprika', name: 'Paprika fumé', amount: 1, unit: 'c. à c.' },
      { ref: 'riz', name: 'Riz basmati', amount: 300, unit: 'g' },
    ],
    steps: [
      {
        ref: 'base',
        content: 'Faire revenir {oignon} et {poivron}, puis {boeuf} avec {cumin} et {paprika}.',
      },
      {
        ref: 'mijoter',
        content: 'Ajouter {tomates} et laisser mijoter à feu doux. {timer}',
        timerSeconds: 3600,
      },
      { ref: 'servir', content: 'Servir avec {riz}.' },
    ],
  },
  {
    title: 'Taboulé à la menthe',
    baseServings: 4,
    ingredients: [
      { ref: 'semoule', name: 'Semoule fine', amount: 200, unit: 'g' },
      { ref: 'tomates', name: 'Tomates', amount: 300, unit: 'g' },
      { ref: 'concombre', name: 'Concombre', amount: 150, unit: 'g' },
      { ref: 'menthe', name: 'Menthe fraîche', amount: 15, unit: 'g' },
      { ref: 'persil', name: 'Persil plat', amount: 20, unit: 'g' },
      { ref: 'citron', name: 'Citrons jaunes', amount: 2, unit: null },
      { ref: 'huile', name: 'Huile d’olive', amount: 4, unit: 'c. à s.' },
    ],
    steps: [
      {
        ref: 'gonfler',
        content: 'Arroser {semoule} du jus de {citron} et d’{huile}, laisser gonfler. {timer}',
        timerSeconds: 900,
      },
      {
        ref: 'assembler',
        content: 'Ajouter {tomates} et {concombre} en dés, {menthe} et {persil} ciselés.',
      },
      { ref: 'reposer', content: 'Réserver au frais avant de servir.', timerSeconds: 3600 },
    ],
  },
]
