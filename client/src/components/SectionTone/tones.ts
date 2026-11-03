/** Badge colour families; each has a background and an ink token in theme.css. */
export type BadgeTone =
  | 'produce'
  | 'meat'
  | 'dairy'
  | 'fruit'
  | 'seafood'
  | 'deli'
  | 'bakery'
  | 'pantry'
  | 'frozen'
  | 'neutral'

export const BADGE_TONES: readonly BadgeTone[] = [
  'produce',
  'meat',
  'dairy',
  'fruit',
  'seafood',
  'deli',
  'bakery',
  'pantry',
  'frozen',
  'neutral'
]
