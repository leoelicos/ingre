/*
 * The allergens an ingredient may carry (#181): the FSANZ mandatory allergen declarations
 * (Food Standards Code 1.2.3, Plain English Allergen Labelling). Real allergens only, so no
 * intolerances such as lactose. Gluten and tree nuts name the cereal or nut, as PEAL does.
 */
export const FSANZ_ALLERGENS: readonly string[] = [
  'crustacean',
  'egg',
  'fish',
  'gluten (barley)',
  'gluten (oats)',
  'gluten (rye)',
  'lupin',
  'milk',
  'mollusc',
  'peanut',
  'sesame',
  'soy',
  'tree nut (almond)',
  'tree nut (brazil nut)',
  'tree nut (cashew)',
  'tree nut (hazelnut)',
  'tree nut (macadamia)',
  'tree nut (pecan)',
  'tree nut (pine nut)',
  'tree nut (pistachio)',
  'tree nut (walnut)',
  'wheat'
]
