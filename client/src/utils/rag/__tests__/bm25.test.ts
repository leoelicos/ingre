import { buildIndex, scoreAll } from '../bm25'

const docs = [
  { id: 'a', tokens: ['carrot', 'carrot', 'root'] },
  { id: 'b', tokens: ['flour', 'baking', 'root'] },
  { id: 'c', tokens: ['lemon'] }
]

describe('BM25 (#225)', () => {
  it('indexes document frequency and average length', () => {
    const index = buildIndex(docs)
    expect(index.frequency.get('root')).toBe(2)
    expect(index.frequency.get('carrot')).toBe(1)
    expect(index.averageLength).toBeCloseTo(2.333, 2)
  })

  it('scores only the documents a query reaches, best match first', () => {
    const scores = scoreAll(buildIndex(docs), ['carrot'])
    expect([...scores.keys()]).toEqual(['a'])
  })

  it('scores a word in more of its document higher, and a rarer word higher', () => {
    const index = buildIndex(docs)
    const carrot = scoreAll(index, ['carrot']).get('a') ?? 0
    const root = scoreAll(index, ['root']).get('a') ?? 0
    expect(carrot).toBeGreaterThan(root)
  })

  it('counts a repeated query word once', () => {
    const index = buildIndex(docs)
    expect(scoreAll(index, ['lemon', 'lemon'])).toEqual(
      scoreAll(index, ['lemon'])
    )
  })

  it('finds nothing for an unknown word or an empty corpus', () => {
    expect(scoreAll(buildIndex(docs), ['zzz']).size).toBe(0)
    expect(scoreAll(buildIndex([]), ['carrot']).size).toBe(0)
    expect(buildIndex([]).averageLength).toBe(0)
  })
})
