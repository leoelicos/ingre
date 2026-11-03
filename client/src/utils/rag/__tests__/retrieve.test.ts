import { PROFILES } from '../corpus'
import { sentence } from '../explain'
import { indexOf, named, retrieve } from '../retrieve'

const ask = (text: string, avoid: string[] = [], limit = 10) =>
  retrieve({ text, avoid, limit })
const ids = (text: string, avoid: string[] = []) =>
  ask(text, avoid).map((hit) => hit.id)

describe('retrieval over the corpus (#225)', () => {
  it('finds the ingredients a text names, however they are pluralised', () => {
    expect(named('Carrots and red lentils', PROFILES).map((p) => p.id)).toEqual(
      ['carrot', 'red-lentils']
    )
    expect(named('red', PROFILES)).toEqual([])
  })

  it('suggests classic partners of what you have, not what you already have', () => {
    const got = ids('carrots and flour')
    expect(got).not.toContain('carrot')
    expect(got).not.toContain('plain-flour')
    expect(got.slice(0, 3)).toEqual(expect.arrayContaining(['butter']))
    expect(got).toContain('white-sugar')
    expect(got).toContain('egg')
  })

  it('puts a partner of two things you have above a partner of one', () => {
    const top = ask('carrots and flour', [], 3)
    expect(top.map((hit) => hit.id)).toEqual(
      expect.arrayContaining(['butter', 'white-sugar'])
    )
    expect(top[0]?.reasons[0]).toEqual({
      kind: 'partner',
      with: ['carrot', 'plain flour']
    })
  })

  it('searches the profile text for words that name no ingredient', () => {
    const got = ask('curry', [], 60).map((hit) => hit.id)
    expect(got).toContain('garam-masala')
    expect(got).toContain('coconut-milk')
    expect(ask('curry')[0]?.reasons).toContainEqual({
      kind: 'match',
      terms: ['curry']
    })
  })

  it('is the same every time for the same text', () => {
    expect(ask('tomato basil')).toEqual(ask('tomato basil'))
  })

  it('removes locked allergens before ranking, so they never appear', () => {
    const open = ids('carrots and flour')
    expect(open).toContain('butter')
    const locked = ids('carrots and flour', ['milk', 'egg'])
    expect(locked).not.toContain('butter')
    expect(locked).not.toContain('egg')
    expect(locked.length).toBeGreaterThan(0)
  })

  it('fills the limit from the next best once a lock removes one', () => {
    expect(ask('carrots and flour', ['milk'], 5)).toHaveLength(5)
  })

  it('returns nothing for an empty text, a text that reaches nothing, or a limit of 0', () => {
    expect(ask('')).toEqual([])
    expect(ask('zzzz qqqq')).toEqual([])
    expect(ask('carrot', [], 0)).toEqual([])
  })

  it('credits shared cooking style', () => {
    const hit = ask('pumpkin', [], 60).find((h) => h.id === 'sweet-potato')
    expect(hit?.reasons).toContainEqual({
      kind: 'style',
      tags: ['roast'],
      with: ['pumpkin']
    })
  })

  it('can run over a smaller set of profiles', () => {
    const small = PROFILES.slice(0, 12)
    const hits = retrieve(
      { text: 'beef mince', avoid: [], limit: 20 },
      small,
      indexOf(small)
    )
    expect(hits.length).toBeGreaterThan(0)
    hits.forEach((hit) => expect(small.map((p) => p.id)).toContain(hit.id))
  })

  it('only ever says what the corpus says: every name in a reason is a profile', () => {
    const names = new Set(PROFILES.map((profile) => profile.name))
    const tags = new Set(
      PROFILES.flatMap((profile) => [...profile.classes, ...profile.style])
    )
    ask('carrots and flour')
      .concat(ask('curry lentils'))
      .forEach((hit) =>
        hit.reasons.forEach((reason) => {
          if (reason.kind === 'partner')
            reason.with.forEach((name) => expect(names.has(name)).toBe(true))
          if (reason.kind === 'style')
            reason.tags.forEach((tag) => expect(tags.has(tag)).toBe(true))
        })
      )
  })

  it('writes one sentence per kind of reason', () => {
    expect(sentence({ kind: 'partner', with: ['carrot', 'plain flour'] })).toBe(
      'Goes with carrot, plain flour.'
    )
    expect(
      sentence({ kind: 'style', tags: ['roast', 'comfort'], with: ['pumpkin'] })
    ).toBe('Shares roast, comfort cooking with pumpkin.')
    expect(sentence({ kind: 'match', terms: ['curry'] })).toBe('Matches curry.')
  })
})
