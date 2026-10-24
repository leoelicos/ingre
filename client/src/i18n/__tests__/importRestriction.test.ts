/**
 * @jest-environment node
 */
/*
 * Only src/i18n may import i18next or react-i18next (eslint no-restricted-imports), so the
 * library can be swapped later without touching components.
 */
import { spawnSync } from 'child_process'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative, sep } from 'path'

jest.setTimeout(30000)

const CLIENT = join(__dirname, '..', '..', '..')
const SRC = join(CLIENT, 'src')

const ESLINT = join(CLIENT, 'node_modules', '.bin', 'eslint')

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null

/** The messages of ESLint's JSON report, as rule and text. */
const messagesOf = (report: unknown): { rule: unknown; text: unknown }[] =>
  (Array.isArray(report) ? report : [])
    .filter(isRecord)
    .flatMap((result) =>
      Array.isArray(result['messages']) ? result['messages'] : []
    )
    .filter(isRecord)
    .map((message) => ({ rule: message['ruleId'], text: message['message'] }))

/** The no-restricted-imports messages the project's ESLint config gives this code at this path. */
const restricted = (code: string, path: string): unknown[] => {
  const run = spawnSync(
    ESLINT,
    ['--format', 'json', '--stdin', '--stdin-filename', path],
    { cwd: CLIENT, input: code, encoding: 'utf8' }
  )
  const report: unknown = JSON.parse(run.stdout)
  return messagesOf(report)
    .filter((message) => message.rule === 'no-restricted-imports')
    .map((message) => message.text)
}

const IMPORTS = [
  "import i18next from 'i18next'\n",
  "import { useTranslation } from 'react-i18next'\n",
  "import type { TFunction } from 'i18next'\n",
  "import { Trans } from 'react-i18next/TransWithoutContext'\n"
]

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.tsx?$/.test(name) ? [path] : []
  })

describe('only src/i18n imports i18next (no-restricted-imports)', () => {
  it.each(IMPORTS)('is an error outside src/i18n: %s', (code) => {
    const messages = restricted(code, 'src/pages/List/Example.tsx')
    expect(messages).toHaveLength(1)
    expect(messages[0]).toMatch(/Use the helpers in src\/i18n/)
  })

  it.each(IMPORTS)('is allowed inside src/i18n: %s', (code) => {
    expect(restricted(code, 'src/i18n/example.ts')).toEqual([])
  })

  it('our own helpers are fine anywhere', () => {
    expect(
      restricted(
        "import { formatQuantity, useT } from '../../i18n'\n",
        'src/pages/List/Example.tsx'
      )
    ).toEqual([])
  })

  it('no file outside src/i18n imports i18next today', () => {
    const offenders = sourceFiles(SRC)
      .filter((file) => !relative(SRC, file).startsWith(`i18n${sep}`))
      .filter((file) =>
        /from '(react-)?i18next[/']/.test(readFileSync(file, 'utf8'))
      )
    expect(offenders).toEqual([])
  })
})
