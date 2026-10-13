/**
 * Shop sections: the single place to rename or regroup them. Generic names (no store
 * layout, branches differ); sections are shown in this fixed order and empty ones hidden.
 * Catalogue items store an `aisle` id; Pantry keeps the aisle as a quiet subsection.
 */
export type ShopSection =
  | 'Fruit & Veg'
  | 'Meat & Seafood'
  | 'Dairy, Eggs & Fridge'
  | 'Deli'
  | 'Bakery'
  | 'Pantry'
  | 'Frozen'

export const SHOP_SECTIONS: readonly ShopSection[] = [
  'Fruit & Veg',
  'Meat & Seafood',
  'Dairy, Eggs & Fridge',
  'Deli',
  'Bakery',
  'Pantry',
  'Frozen'
]

export type Aisle =
  | 'fruit & veg'
  | 'meat'
  | 'seafood'
  | 'dairy & eggs'
  | 'baking'
  | 'canned food'
  | 'herbs & spices'
  | 'international'
  | 'oils & vinegar'
  | 'pasta & rice'
  | 'sauces'

export const AISLES: readonly Aisle[] = [
  'fruit & veg',
  'meat',
  'seafood',
  'dairy & eggs',
  'baking',
  'canned food',
  'herbs & spices',
  'international',
  'oils & vinegar',
  'pasta & rice',
  'sauces'
]

const AISLE_SECTION: Readonly<Record<Aisle, ShopSection>> = {
  'fruit & veg': 'Fruit & Veg',
  meat: 'Meat & Seafood',
  seafood: 'Meat & Seafood',
  'dairy & eggs': 'Dairy, Eggs & Fridge',
  baking: 'Pantry',
  'canned food': 'Pantry',
  'herbs & spices': 'Pantry',
  international: 'Pantry',
  'oils & vinegar': 'Pantry',
  'pasta & rice': 'Pantry',
  sauces: 'Pantry'
}

/** Section for an aisle, plus the aisle as a subsection when the section groups several. */
export const placeInShop = (
  aisle: Aisle
): { section: ShopSection; subsection: string | null } => {
  const section = AISLE_SECTION[aisle]
  return {
    section,
    subsection: section === 'Pantry' ? capitalise(aisle) : null
  }
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
