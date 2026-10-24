import { readdirSync, readFileSync, statSync } from 'fs'
import { join, relative } from 'path'

/* #169: tests use real providers and injected seams, never module mocks. */
const MODULE_MOCK =
  /\bjest\s*\.\s*(mock|doMock|unstable_mockModule|setMock)\s*\(/

const REPO = join(__dirname, '..', '..', '..')
const ROOTS = ['client/src', 'server/src', 'server/config', 'automation']

const filesUnder = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (name === 'node_modules') return []
    return statSync(path).isDirectory() ? filesUnder(path) : [path]
  })

const existing = (dir: string): string[] => {
  try {
    return filesUnder(dir)
  } catch {
    return []
  }
}

describe('no module mocks (#169)', () => {
  it('finds no jest module mock anywhere in the repo', () => {
    const offenders = ROOTS.flatMap((root) => existing(join(REPO, root)))
      .filter((path) => /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(path))
      .filter((path) => MODULE_MOCK.test(readFileSync(path, 'utf8')))
      .map((path) => relative(REPO, path))
    expect(offenders).toEqual([])
  })

  it('recognises one', () => {
    // built from parts so this file does not match itself
    expect(
      MODULE_MOCK.test(['jest', "mock('../x', () => ({}))"].join('.'))
    ).toBe(true)
    expect(MODULE_MOCK.test('jest.spyOn(console, "error")')).toBe(false)
  })
})
