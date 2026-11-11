/*
 * Examples of what the War room understands (t26u), one per thing the parser reads.
 * The text lives in the locale (warRoom.prompts.<key>); a test reads every one through
 * captureOf, so an example can never promise something the parser does not do.
 */

export type PromptKind =
  | 'count'
  | 'pack'
  | 'measure'
  | 'after'
  | 'dozen'
  | 'several'
  | 'typo'
  | 'anyOrder'

export interface Prompt {
  /** key under warRoom.prompts */
  readonly key: string
  readonly kind: PromptKind
}

export const PROMPTS: readonly Prompt[] = [
  { key: 'carrots', kind: 'count' },
  { key: 'chickpeas', kind: 'pack' },
  { key: 'flour', kind: 'measure' },
  { key: 'lemons', kind: 'after' },
  { key: 'eggs', kind: 'dozen' },
  { key: 'stirFry', kind: 'several' },
  { key: 'coriander', kind: 'pack' },
  { key: 'broccoli', kind: 'typo' },
  { key: 'mince', kind: 'anyOrder' },
  { key: 'breakfast', kind: 'several' },
  { key: 'spinach', kind: 'pack' },
  { key: 'butter', kind: 'measure' },
  { key: 'onion', kind: 'count' },
  { key: 'tuna', kind: 'pack' },
  { key: 'curry', kind: 'several' },
  { key: 'avocado', kind: 'typo' }
]

/** The example after `index`, round and round. */
export const nextPrompt = (index: number): number =>
  (index + 1) % PROMPTS.length
