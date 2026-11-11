import { copyLines, newCopy } from '../../balance/copies'
import { catalogue, library } from '../../library/recipeLibrary'
import { parseConstraint } from '../parse'
import { lineNamed, resolveConstraint } from '../resolve'

const recipe = (id: string) => {
  const found = library.find((r) => r.id === id)
  if (found === undefined) throw new Error(`no recipe ${id}`)
  return found
}
const lines = (id: string) => copyLines(recipe(id), newCopy(id), catalogue)
const resolve = (id: string, text: string) => {
  const constraint = parseConstraint(text)
  if (constraint === null) throw new Error(`unreadable ${text}`)
  return resolveConstraint(constraint, lines(id))
}

describe('resolveConstraint (#233)', () => {
  it('sets portions', () => {
    expect(resolve('dahl', 'portion for 3')).toEqual({
      kind: 'portions',
      portions: 3
    })
  })

  it('refuses portions outside 1 to 12 instead of clamping silently', () => {
    expect(resolve('dahl', 'portion for 0')).toEqual({ kind: 'range' })
    expect(resolve('dahl', 'portion for 13')).toEqual({ kind: 'range' })
  })

  it('cuts an ingredient down to "at most", in the recipe\'s own measure', () => {
    expect(resolve('dahl', 'at most 100 g red lentils')).toEqual({
      kind: 'set',
      ingredientId: 'red-lentils',
      name: 'red lentils',
      quantity: 100,
      measure: 'g'
    })
  })

  it('raises an ingredient up to "at least"', () => {
    expect(resolve('dahl', 'at least 0.3 kg red lentils')).toMatchObject({
      kind: 'set',
      quantity: 300
    })
  })

  it('leaves it alone when it is already within', () => {
    expect(resolve('dahl', 'at most 1 kg red lentils')).toEqual({
      kind: 'within',
      name: 'red lentils'
    })
    expect(resolve('dahl', 'at least 10 g red lentils')).toEqual({
      kind: 'within',
      name: 'red lentils'
    })
  })

  it('counts whole items, and converts weights for them through their size', () => {
    expect(resolve('spaghetti-bolognese', 'at least 2 carrots')).toMatchObject({
      kind: 'set',
      ingredientId: 'carrot',
      quantity: 2,
      measure: 'whole'
    })
    expect(resolve('spaghetti-bolognese', 'at most 100 g carrots')).toEqual({
      kind: 'within',
      name: 'carrot'
    })
  })

  it('says so when the recipe has no such ingredient', () => {
    expect(resolve('dahl', 'at most 1 kg carrots')).toEqual({
      kind: 'missing',
      ingredient: 'carrots'
    })
  })

  it('says so when the units cannot be compared', () => {
    expect(resolve('dahl', 'at most 2 red lentils')).toEqual({
      kind: 'unit',
      name: 'red lentils'
    })
  })

  it('has no item to compare with for a line that is not in the catalogue', () => {
    const [line] = lines('dahl')
    if (line === undefined) throw new Error('no line')
    const orphan = { ...line, item: null, name: 'mystery' }
    expect(
      resolveConstraint(
        {
          kind: 'bound',
          bound: 'atMost',
          amount: 1,
          unit: 'g',
          ingredient: 'mystery'
        },
        [orphan]
      )
    ).toEqual({ kind: 'unit', name: 'mystery' })
  })
})

describe('lineNamed', () => {
  it('prefers the exact name, then the shortest that holds every word, and skips removed lines', () => {
    const base = lines('spaghetti-bolognese')
    expect(lineNamed(base, 'carrots')?.ingredientId).toBe('carrot')
    expect(lineNamed(base, 'tomato')?.name).toMatch(/tomato/)
    const removed = base.map((line) =>
      line.ingredientId === 'carrot' ? { ...line, quantity: 0 } : line
    )
    expect(lineNamed(removed, 'carrots')).toBeNull()
  })
})
