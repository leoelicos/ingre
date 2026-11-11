/* BM25 ranking, written out: free, local, no embeddings or services (#225). */

export interface Doc {
  id: string
  tokens: readonly string[]
}

export interface Index {
  docs: readonly Doc[]
  averageLength: number
  frequency: ReadonlyMap<string, number>
}

const K1 = 1.2
const B = 0.75

/** How many documents each word appears in. */
const frequencies = (docs: readonly Doc[]): Map<string, number> => {
  const counts = new Map<string, number>()
  docs.forEach((doc) =>
    new Set(doc.tokens).forEach((word) =>
      counts.set(word, (counts.get(word) ?? 0) + 1)
    )
  )
  return counts
}

export const buildIndex = (docs: readonly Doc[]): Index => ({
  docs,
  averageLength:
    docs.reduce((sum, doc) => sum + doc.tokens.length, 0) /
    Math.max(docs.length, 1),
  frequency: frequencies(docs)
})

const idf = (index: Index, word: string): number => {
  const n = index.frequency.get(word) ?? 0
  return Math.log(1 + (index.docs.length - n + 0.5) / (n + 0.5))
}

const termScore = (index: Index, doc: Doc, word: string): number => {
  const count = doc.tokens.filter((token) => token === word).length
  const lengthNorm = 1 - B + (B * doc.tokens.length) / index.averageLength
  return (idf(index, word) * (count * (K1 + 1))) / (count + K1 * lengthNorm)
}

/** One BM25 score per document the query reaches; documents it does not reach are absent. */
export const scoreAll = (
  index: Index,
  query: readonly string[]
): Map<string, number> => {
  const words = Array.from(new Set(query))
  const scores = new Map<string, number>()
  index.docs.forEach((doc) => {
    const score = words.reduce(
      (sum, word) => sum + termScore(index, doc, word),
      0
    )
    if (score > 0) scores.set(doc.id, score)
  })
  return scores
}
