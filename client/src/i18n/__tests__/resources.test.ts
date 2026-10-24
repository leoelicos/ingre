/*
 * The English resource file is the one place UI wording lives: every key the code asks for
 * exists, every key in the file is used, and plural keys come in _one/_other pairs.
 */
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'
import en from '../locales/en.json'
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
      )
    ].flatMap((m) =>
      m.slice(1).filter((key): key is string => key !== undefined)
    )
  )

/** Keys the code builds at run time: measure words by measure. */
const DYNAMIC = /^measure\./

describe('English resources', () => {
  const keys = leafKeys(en)
  const bases = new Set(keys.map(baseKey))

  it('English is the only locale for now', () => {
    expect(Object.keys(resources)).toEqual(['en'])
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
