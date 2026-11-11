/* Retrieval over the profiles (#225): what to add next to what you have. Hard locks (allergens
   to avoid) remove candidates before anything is ranked. BM25 over the profile text plus the
   curated pairings; no model, no embeddings, no network. */
import type { Doc, Index } from './bm25'
import { buildIndex, scoreAll } from './bm25'
import type { Profile } from './corpus'
import { PROFILES } from './corpus'
import { tokenise } from './text'

/** Why a profile was returned, each reason read straight off the corpus. */
export type Reason =
  | { kind: 'partner'; with: readonly string[] }
  | { kind: 'style'; tags: readonly string[]; with: readonly string[] }
  | { kind: 'match'; terms: readonly string[] }

export interface Hit {
  id: string
  name: string
  score: number
  reasons: readonly Reason[]
}

export interface Query {
  text: string
  /** Allergens to avoid: a profile carrying one is never returned. */
  avoid: readonly string[]
  limit: number
}

const PAIRING_WEIGHT = 2
const STYLE_WEIGHT = 0.25

/** Name words count three times, classes and style tags once, partners' names once. */
const docOf = (profile: Profile, all: readonly Profile[]): Doc => {
  const nameWords = tokenise(profile.name)
  const partners = all
    .filter((other) => profile.goesWith.includes(other.id))
    .flatMap((other) => tokenise(other.name))
  return {
    id: profile.id,
    tokens: [
      ...nameWords,
      ...nameWords,
      ...nameWords,
      ...profile.classes.flatMap(tokenise),
      ...profile.style.flatMap(tokenise),
      ...partners
    ]
  }
}

export const indexOf = (profiles: readonly Profile[]): Index =>
  buildIndex(profiles.map((profile) => docOf(profile, profiles)))

const nameWords = (profile: Profile): string[] => tokenise(profile.name)

const fullyNamed = (words: ReadonlySet<string>, profile: Profile): boolean =>
  nameWords(profile).every((word) => words.has(word))

/**
 * The ingredients the text names: every word of the name is in the text ("red lentils"), or, for
 * a word no full name used, the ingredients that end in it ("flour" is plain flour).
 */
export const named = (
  text: string,
  profiles: readonly Profile[]
): Profile[] => {
  const words = new Set(tokenise(text))
  const full = profiles.filter((profile) => fullyNamed(words, profile))
  const used = new Set(full.flatMap(nameWords))
  const heads = profiles.filter(
    (profile) =>
      !full.includes(profile) &&
      words.has(nameWords(profile).slice(-1).join('')) &&
      !used.has(nameWords(profile).slice(-1).join(''))
  )
  return [...full, ...heads]
}

const shared = (a: readonly string[], b: readonly string[]): string[] =>
  a.filter((tag) => b.includes(tag))

const partnerReason = (
  candidate: Profile,
  seeds: readonly Profile[]
): Reason[] => {
  const partners = seeds.filter((seed) => candidate.goesWith.includes(seed.id))
  return partners.length === 0
    ? []
    : [{ kind: 'partner', with: partners.map((seed) => seed.name) }]
}

const styleReason = (
  candidate: Profile,
  seeds: readonly Profile[]
): Reason[] => {
  const alike = seeds.filter(
    (seed) => shared(candidate.style, seed.style).length > 0
  )
  return alike.length === 0
    ? []
    : [
        {
          kind: 'style',
          tags: Array.from(
            new Set(
              alike.flatMap((seed) => shared(candidate.style, seed.style))
            )
          ),
          with: alike.map((seed) => seed.name)
        }
      ]
}

const matchReason = (terms: readonly string[]): Reason[] =>
  terms.length === 0 ? [] : [{ kind: 'match', terms }]

const reasonsFor = (
  candidate: Profile,
  seeds: readonly Profile[],
  matched: readonly string[]
): Reason[] => [
  ...partnerReason(candidate, seeds),
  ...styleReason(candidate, seeds),
  ...matchReason(matched)
]

const scoreOf = (
  candidate: Profile,
  seeds: readonly Profile[],
  text: number
): number =>
  text +
  PAIRING_WEIGHT *
    seeds.filter((seed) => candidate.goesWith.includes(seed.id)).length +
  STYLE_WEIGHT *
    seeds.reduce(
      (sum, seed) => sum + shared(candidate.style, seed.style).length,
      0
    )

/** Words of the query that appear in the candidate's name or tags, for "matches" reasons. */
const matchedTerms = (candidate: Profile, queryWords: readonly string[]) => {
  const own = new Set(
    [candidate.name, ...candidate.classes, ...candidate.style].flatMap(tokenise)
  )
  return Array.from(new Set(queryWords.filter((word) => own.has(word))))
}

const INDEX = indexOf(PROFILES)

/**
 * Ideas for a text: the ingredients it names are what you have (left out of the results), the
 * rest of the words search the profile text. Locks first, then rank, then the top few.
 */
export const retrieve = (
  query: Query,
  profiles: readonly Profile[] = PROFILES,
  index: Index = INDEX
): Hit[] => {
  const seeds = named(query.text, profiles)
  const words = tokenise(query.text)
  const text = scoreAll(index, words)
  const open = profiles.filter(
    (profile) =>
      !seeds.includes(profile) &&
      !profile.allergens.some((allergen) => query.avoid.includes(allergen))
  )
  return open
    .map((profile) => ({
      id: profile.id,
      name: profile.name,
      score: scoreOf(profile, seeds, text.get(profile.id) ?? 0),
      reasons: reasonsFor(profile, seeds, matchedTerms(profile, words))
    }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, query.limit)
}
