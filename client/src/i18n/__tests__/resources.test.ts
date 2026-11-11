/*
 * The English resource file is the one place UI wording lives: every key the code asks for
 * exists, every key in the file is used, and plural keys come in _one/_other pairs.
 * Japanese mirrors it key for key, with the plural forms Intl.PluralRules('ja') asks for.
 */
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'
import en from '../locales/en.json'
import ja from '../locales/ja.json'
import { resources } from '../locales'

const SRC = join(__dirname, '..', '..')

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory())
      return name === '__tests__' ? [] : sourceFiles(path)
    return /\.tsx?$/.test(name) && !name.endsWith('.d.ts') ? [path] : []
  })

/** Every leaf key of a nested message object: "filter.hidden", "item_one". */
const leafKeys = (messages: object, prefix = ''): string[] =>
  Object.entries(messages).flatMap(([key, value]: [string, unknown]) =>
    typeof value === 'object' && value !== null
      ? leafKeys(value, `${prefix}${key}.`)
      : [`${prefix}${key}`]
  )

const PLURAL = /_(one|other)$/

/** A key as the code asks for it: plural suffixes dropped. */
const baseKey = (key: string): string => key.replace(PLURAL, '')

/** Literal keys passed to translate(...), translateOr(...) or t(...), or chosen by a ternary. */
const usedKeys = (): string[] =>
  sourceFiles(SRC).flatMap((file) =>
    [
      ...readFileSync(file, 'utf8').matchAll(
        /\b(?:translate|translateOr|t)\(\s*'([^'$]+)'/g
      ),
      ...readFileSync(file, 'utf8').matchAll(
        /\? '([a-zA-Z]+\.[a-zA-Z.]+)'\s*:\s*'([a-zA-Z]+\.[a-zA-Z.]+)'/g
      ),
      ...readFileSync(file, 'utf8').matchAll(/<RichText\s+k="([^"]+)"/g)
    ].flatMap((m) =>
      m.slice(1).filter((key): key is string => key !== undefined)
    )
  )

/** Keys the code builds at run time: measure words by measure, the dial's modes by mode (#206), explore sections, account options, and tier names/features. */
const DYNAMIC =
  /^(measure\.|guidance\.(self-directed|guided|assisted|hand-held)$|exploreSection\.|explore\.addName|account\.(biometric|google|plans)|tiers\.(names|features)\.|warRoomEntry\.(prompts|shortcuts)\.)/

describe('English resources', () => {
  const keys = leafKeys(en)
  const bases = new Set(keys.map(baseKey))

  it('ships English and Japanese', () => {
    expect(Object.keys(resources)).toEqual(['en', 'ja'])
  })

  it('every key the code asks for is in the English file', () => {
    const used = usedKeys()
    expect(used.length).toBeGreaterThan(100)
    expect(used.filter((key) => !bases.has(key))).toEqual([])
  })

  it('every key in the English file is used', () => {
    const used = new Set(usedKeys())
    expect(
      [...bases].filter((key) => !used.has(key) && !DYNAMIC.test(key))
    ).toEqual([])
  })

  it('plural keys come in _one and _other pairs', () => {
    const plural = keys.filter((key) => PLURAL.test(key))
    expect(plural.length).toBeGreaterThan(0)
    plural.forEach((key) => {
      expect(keys).toContain(`${baseKey(key)}_one`)
      expect(keys).toContain(`${baseKey(key)}_other`)
    })
  })

  it('the scan sees the app, not the tests', () => {
    const files = sourceFiles(SRC).map((file) => relative(SRC, file))
    expect(files).toContain(join('pages', 'List', 'Explore.tsx'))
    expect(files.some((file) => file.includes('__tests__'))).toBe(false)
  })
})

/** The plural forms a locale's rules can select, e.g. ['one', 'other'] or ['other']. */
const pluralForms = (lng: string): string[] =>
  new Intl.PluralRules(lng).resolvedOptions().pluralCategories

/** The keys a locale needs: each English key, with plural keys in that locale's forms. */
const expectedKeys = (lng: string): string[] => [
  ...new Set(
    leafKeys(en).flatMap((key) =>
      PLURAL.test(key)
        ? pluralForms(lng).map((form) => `${baseKey(key)}_${form}`)
        : [key]
    )
  )
]

/** Japanese that may read exactly as the English: units, symbols, the HACCP acronym, and
 * search examples, which stay English while the catalogue is English. */
const SAME_AS_ENGLISH = new Set([
  'measure.g',
  'measure.kg',
  'measure.ml',
  'measure.L',
  'customisation.changed',
  'explore.onListName',
  'explore.addName',
  'exploreSection.onListMark',
  'exploreSection.onListName',
  'tiers.features.haccp',
  'suggest.money',
  'ideas.queryPlaceholder',
  'preferences.textSize.unit',
  'demo.placeholder',
  // War room keys and typed examples, which stay as typed on a keyboard
  'warRoomEntry.prompts.carrots',
  'warRoomEntry.prompts.chickpeas',
  'warRoomEntry.prompts.flour',
  'warRoomEntry.prompts.lemons',
  'warRoomEntry.prompts.eggs',
  'warRoomEntry.prompts.stirFry',
  'warRoomEntry.prompts.coriander',
  'warRoomEntry.prompts.broccoli',
  'warRoomEntry.prompts.mince',
  'warRoomEntry.prompts.breakfast',
  'warRoomEntry.prompts.spinach',
  'warRoomEntry.prompts.butter',
  'warRoomEntry.prompts.onion',
  'warRoomEntry.prompts.tuna',
  'warRoomEntry.prompts.curry',
  'warRoomEntry.prompts.avocado',
  'warRoomEntry.shortcuts.enter.keys',
  'warRoomEntry.shortcuts.arrows.keys',
  'warRoomEntry.shortcuts.tab.keys',
  'warRoomEntry.shortcuts.escape.keys',
  'warRoomEntry.shortcuts.undo.keys',
  'warRoomEntry.shortcuts.slash.keys'
])

/** Every {{placeholder}} and <tag> a message uses, sorted. */
const slots = (message: string): string[] =>
  [...message.matchAll(/\{\{(\w+)\}\}|<(\w+)\/?>/g)]
    .map((m) => m[1] ?? m[2] ?? '')
    .sort()

describe('Japanese resources', () => {
  const englishValues = new Map(
    leafKeys(en).map((key) => [key, String(lookup(en, key))])
  )
  const english = (key: string): string =>
    englishValues.get(key) ??
    englishValues.get(`${baseKey(key)}_other`) ??
    `missing ${key}`

  it('Japanese has one plural form, other', () => {
    expect(pluralForms('ja')).toEqual(['other'])
  })

  it('has exactly the English keys, plurals in its own forms: none missing, none extra', () => {
    const keys = leafKeys(ja)
    const wanted = expectedKeys('ja')
    expect(wanted.filter((key) => !keys.includes(key))).toEqual([])
    expect(keys.filter((key) => !wanted.includes(key))).toEqual([])
    expect(keys.length).toBeGreaterThan(350)
  })

  it('every message is translated, apart from the allowed units and symbols', () => {
    const same = leafKeys(ja).filter(
      (key) => String(lookup(ja, key)) === english(key)
    )
    expect(same.filter((key) => !SAME_AS_ENGLISH.has(key))).toEqual([])
    expect([...SAME_AS_ENGLISH].filter((key) => !same.includes(key))).toEqual(
      []
    )
  })

  it('every message keeps the English placeholders and tags', () => {
    leafKeys(ja)
      .filter((key) => key !== 'countUnit_other')
      .forEach((key) => {
        expect([key, slots(String(lookup(ja, key)))]).toEqual([
          key,
          slots(english(key))
        ])
      })
  })

  it('counted units use one Japanese counter, not the catalogue’s English words', () => {
    expect(lookup(ja, 'countUnit_other')).toBe('個')
  })

  it('no message is empty', () => {
    leafKeys(ja).forEach((key) => {
      expect([key, String(lookup(ja, key)).trim().length > 0]).toEqual([
        key,
        true
      ])
    })
  })
})

/** The value at a dotted key: "filter.hidden". */
function lookup(messages: object, key: string): unknown {
  const [head = '', ...rest] = key.split('.')
  const entries = new Map(Object.entries(messages))
  const direct = entries.get(key)
  if (direct !== undefined) return direct
  const next: unknown = entries.get(head)
  return typeof next === 'object' && next !== null
    ? lookup(next, rest.join('.'))
    : undefined
}
