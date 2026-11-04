/* Ingredient classes for the customer profile (#224): broad groups and the finer classes in them. */

export type Group =
  | 'vegetables'
  | 'fruit'
  | 'proteins'
  | 'dairy'
  | 'carbs'
  | 'flavour'
  | 'treats'
export const GROUPS: readonly Group[] = [
  'vegetables',
  'fruit',
  'proteins',
  'dairy',
  'carbs',
  'flavour',
  'treats'
]

/** Finer classes, listed group by group; 'other' is anything outside the catalogue. */
export type IngredientClass =
  | 'leafy-green'
  | 'root-vegetable'
  | 'allium'
  | 'brassica'
  | 'fruiting-vegetable'
  | 'other-vegetable'
  | 'citrus'
  | 'orchard-fruit'
  | 'berry'
  | 'tropical-fruit'
  | 'beef'
  | 'pork'
  | 'poultry'
  | 'processed-meat'
  | 'seafood'
  | 'egg'
  | 'legume'
  | 'nut'
  | 'milk-and-cream'
  | 'cheese'
  | 'yoghurt'
  | 'pasta-and-noodle'
  | 'rice'
  | 'bread'
  | 'breakfast-grain'
  | 'flour'
  | 'fresh-herb'
  | 'fresh-aromatic'
  | 'spice'
  | 'oil-and-vinegar'
  | 'sauce'
  | 'cooking-base'
  | 'sweet'
  | 'drink'
  | 'other'
export const CLASSES: readonly IngredientClass[] = [
  'leafy-green',
  'root-vegetable',
  'allium',
  'brassica',
  'fruiting-vegetable',
  'other-vegetable',
  'citrus',
  'orchard-fruit',
  'berry',
  'tropical-fruit',
  'beef',
  'pork',
  'poultry',
  'processed-meat',
  'seafood',
  'egg',
  'legume',
  'nut',
  'milk-and-cream',
  'cheese',
  'yoghurt',
  'pasta-and-noodle',
  'rice',
  'bread',
  'breakfast-grain',
  'flour',
  'fresh-herb',
  'fresh-aromatic',
  'spice',
  'oil-and-vinegar',
  'sauce',
  'cooking-base',
  'sweet',
  'drink',
  'other'
]

export const GROUP_OF: Readonly<Record<IngredientClass, Group>> = {
  'leafy-green': 'vegetables',
  'root-vegetable': 'vegetables',
  allium: 'vegetables',
  brassica: 'vegetables',
  'fruiting-vegetable': 'vegetables',
  'other-vegetable': 'vegetables',
  citrus: 'fruit',
  'orchard-fruit': 'fruit',
  berry: 'fruit',
  'tropical-fruit': 'fruit',
  beef: 'proteins',
  pork: 'proteins',
  poultry: 'proteins',
  'processed-meat': 'proteins',
  seafood: 'proteins',
  egg: 'proteins',
  legume: 'proteins',
  nut: 'proteins',
  'milk-and-cream': 'dairy',
  cheese: 'dairy',
  yoghurt: 'dairy',
  'pasta-and-noodle': 'carbs',
  rice: 'carbs',
  bread: 'carbs',
  'breakfast-grain': 'carbs',
  flour: 'carbs',
  'fresh-herb': 'flavour',
  'fresh-aromatic': 'flavour',
  spice: 'flavour',
  'oil-and-vinegar': 'flavour',
  sauce: 'flavour',
  'cooking-base': 'flavour',
  sweet: 'treats',
  drink: 'treats',
  other: 'treats'
}

/** The class of every catalogue ingredient, by id. */
export const CLASS_OF: Readonly<Record<string, IngredientClass>> = {
  'iceberg-lettuce': 'leafy-green',
  'baby-spinach': 'leafy-green',
  'salad-mix': 'leafy-green',
  carrot: 'root-vegetable',
  potato: 'root-vegetable',
  'sweet-potato': 'root-vegetable',
  pumpkin: 'root-vegetable',
  onion: 'allium',
  'red-onion': 'allium',
  garlic: 'allium',
  'spring-onion': 'allium',
  cauliflower: 'brassica',
  broccoli: 'brassica',
  tomato: 'fruiting-vegetable',
  cucumber: 'fruiting-vegetable',
  capsicum: 'fruiting-vegetable',
  zucchini: 'fruiting-vegetable',
  celery: 'other-vegetable',
  'bean-sprouts': 'other-vegetable',
  mushrooms: 'other-vegetable',
  corn: 'other-vegetable',
  'tinned-peas': 'other-vegetable',
  'water-chestnuts': 'other-vegetable',
  'kalamata-olives': 'other-vegetable',
  lime: 'citrus',
  orange: 'citrus',
  mandarin: 'citrus',
  lemon: 'citrus',
  'orange-juice': 'drink',
  apple: 'orchard-fruit',
  pear: 'orchard-fruit',
  grapes: 'orchard-fruit',
  strawberries: 'berry',
  blueberries: 'berry',
  banana: 'tropical-fruit',
  kiwifruit: 'tropical-fruit',
  watermelon: 'tropical-fruit',
  avocado: 'tropical-fruit',
  'beef-mince': 'beef',
  'beef-rump': 'beef',
  'pork-mince': 'pork',
  'pork-belly': 'pork',
  'pork-loin-chop': 'pork',
  'chicken-thigh': 'poultry',
  'chicken-breast': 'poultry',
  sausages: 'processed-meat',
  bacon: 'processed-meat',
  'sliced-ham': 'processed-meat',
  'cooked-prawns': 'seafood',
  'canned-tuna': 'seafood',
  egg: 'egg',
  chickpeas: 'legume',
  'red-lentils': 'legume',
  hummus: 'legume',
  'ground-almonds': 'nut',
  'roasted-peanuts': 'nut',
  'peanut-butter': 'nut',
  butter: 'milk-and-cream',
  cream: 'milk-and-cream',
  'full-cream-milk': 'milk-and-cream',
  'light-milk': 'milk-and-cream',
  haloumi: 'cheese',
  feta: 'cheese',
  parmesan: 'cheese',
  cheddar: 'cheese',
  'natural-yoghurt': 'yoghurt',
  'greek-yoghurt': 'yoghurt',
  spaghetti: 'pasta-and-noodle',
  'rice-vermicelli': 'pasta-and-noodle',
  'rice-paper': 'pasta-and-noodle',
  'jasmine-rice': 'rice',
  'basmati-rice': 'rice',
  'white-bread': 'bread',
  'wholemeal-bread': 'bread',
  'bread-rolls': 'bread',
  wraps: 'bread',
  'rolled-oats': 'breakfast-grain',
  'breakfast-cereal': 'breakfast-grain',
  'plain-flour': 'flour',
  'fresh-coriander': 'fresh-herb',
  'fresh-mint': 'fresh-herb',
  ginger: 'fresh-aromatic',
  'green-chilli': 'fresh-aromatic',
  'red-chilli': 'fresh-aromatic',
  lemongrass: 'fresh-aromatic',
  'garam-masala': 'spice',
  'ground-cumin': 'spice',
  'chilli-powder': 'spice',
  'dried-oregano': 'spice',
  salt: 'spice',
  'cumin-seeds': 'spice',
  'ground-coriander': 'spice',
  'ground-turmeric': 'spice',
  'black-pepper': 'spice',
  'olive-oil': 'oil-and-vinegar',
  'vegetable-oil': 'oil-and-vinegar',
  'sesame-oil': 'oil-and-vinegar',
  'red-wine-vinegar': 'oil-and-vinegar',
  'white-vinegar': 'oil-and-vinegar',
  'soy-sauce': 'sauce',
  'oyster-sauce': 'sauce',
  'fish-sauce': 'sauce',
  'hoisin-sauce': 'sauce',
  'coconut-milk': 'cooking-base',
  'crushed-tomatoes': 'cooking-base',
  'tomato-paste': 'cooking-base',
  'white-sugar': 'sweet',
  honey: 'sweet',
  jam: 'sweet',
  coffee: 'drink',
  'tea-bags': 'drink'
}

/** An ingredient's class; 'other' for anything the catalogue does not hold (free-text extras). */
export const classOf = (ingredientId: string): IngredientClass =>
  CLASS_OF[ingredientId] ?? 'other'

export const groupOf = (ingredientClass: IngredientClass): Group =>
  GROUP_OF[ingredientClass]
