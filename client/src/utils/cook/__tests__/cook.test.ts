import type { CopyEntry } from '../../chips/chips'
import { copyEntries } from '../../chips/useChips'
import { newCopy } from '../../balance/copies'
import { library } from '../../library/recipeLibrary'
import { catalogue } from '../../library/recipeLibrary'
import type { CookTable } from '../cook'
import {
  COOK,
  addDays,
  labelsFor,
  parseCook,
  parseDay,
  prepPlan,
  sourcingFor,
  timedSteps,
  timersIn,
  weighOut,
  weightOf
} from '../cook'
import { recipeById } from '../../../test/library'
import cookData from '../../../data/cook.json'

/* #221 Precise execution: the pure rules of the cook plan. */

const entriesOf = (...ids: string[]): CopyEntry[] =>
  copyEntries(ids.map((id) => newCopy(id)))

describe('the bundled data', () => {
  it('only names recipes and ingredients that exist', () => {
    const recipeIds = new Set(library.map((r) => r.id))
    const itemIds = new Set(catalogue.map((i) => i.id))
    expect(
      [...COOK.prepAhead.keys()].filter((id) => !recipeIds.has(id))
    ).toEqual([])
    expect(
      [...COOK.keep.recipes.keys()].filter((id) => !recipeIds.has(id))
    ).toEqual([])
    expect([...COOK.sourcing.keys()].filter((id) => !itemIds.has(id))).toEqual(
      []
    )
    expect(
      [...COOK.keep.components.keys()].filter((id) => !itemIds.has(id))
    ).toEqual([])
  })

  it('keeps cooked food 3 days, and cooked rice and pasta 2 (NSW Food Authority)', () => {
    expect(COOK.keep.fallback).toBe(3)
    expect(COOK.keep.components.get('spaghetti')).toBe(2)
    expect(COOK.keep.components.get('jasmine-rice')).toBe(2)
  })

  it('parses to the same tables it was written with', () => {
    expect(COOK.prepAhead.get('shaking-beef')).toEqual([
      {
        daysBefore: 1,
        task: 'Cut the beef and marinate it, covered, in the fridge. The marinade works in 15 minutes; overnight is fine.'
      }
    ])
    expect(COOK.sourcing.get('rice-paper')).toMatch(/^Asian grocer/)
  })
})

describe('parseCook rejects a bad file', () => {
  const good = {
    prepAhead: { a: [{ daysBefore: 2, task: 'Soak' }] },
    sourcing: { b: 'Butcher' },
    keepDays: { default: 3, recipes: {}, components: { c: 2 } }
  }

  it('accepts a small good one', () => {
    expect(parseCook(good).keep.components.get('c')).toBe(2)
    expect(parseCook(good).prepAhead.get('a')?.[0]?.daysBefore).toBe(2)
  })

  it.each([
    ['not an object', null],
    ['a list', []],
    ['no sourcing', { ...good, sourcing: undefined }],
    ['no keepDays', { ...good, keepDays: 'x' }],
    ['prep not a list', { ...good, prepAhead: { a: 'x' } }],
    ['a step that is not an object', { ...good, prepAhead: { a: ['x'] } }],
    [
      'days that are not whole',
      { ...good, prepAhead: { a: [{ daysBefore: 1.5, task: 'x' }] } }
    ],
    [
      'days of zero',
      { ...good, prepAhead: { a: [{ daysBefore: 0, task: 'x' }] } }
    ],
    [
      'a blank task',
      { ...good, prepAhead: { a: [{ daysBefore: 1, task: ' ' }] } }
    ],
    ['a tip that is not text', { ...good, sourcing: { b: 4 } }],
    [
      'a keep time that is not a number',
      { ...good, keepDays: { ...good.keepDays, default: '3' } }
    ]
  ])('%s', (_name, data) => {
    expect(() => parseCook(data)).toThrow(/^cook: /)
  })
})

describe('timersIn', () => {
  it('finds a plain time', () => {
    expect(timersIn('simmer 30 minutes')).toEqual([
      { text: '30 minutes', seconds: 1800 }
    ])
  })

  it('takes the longest of a range, as written', () => {
    expect(timersIn('sear for 2 to 3 minutes')).toEqual([
      { text: '2 to 3 minutes', seconds: 180 }
    ])
    expect(timersIn('rest 5-6 minutes')).toEqual([
      { text: '5-6 minutes', seconds: 360 }
    ])
  })

  it('reads seconds, hours and a hyphenated unit', () => {
    expect(timersIn('the last 30 seconds')).toEqual([
      { text: '30 seconds', seconds: 30 }
    ])
    expect(timersIn('a 2-hour braise')).toEqual([
      { text: '2-hour', seconds: 7200 }
    ])
    expect(timersIn('1 hour')[0]?.seconds).toBe(3600)
  })

  it('finds several, in order', () => {
    expect(
      timersIn('boil 10 minutes, then rest 1 hour').map((t) => t.text)
    ).toEqual(['10 minutes', '1 hour'])
  })

  it('ignores amounts and words that are not times', () => {
    expect(timersIn('Add 250 ml water and cook until soft')).toEqual([])
    expect(timersIn('Simmer for a few minutes')).toEqual([])
  })
})

describe('timedSteps', () => {
  it('numbers the steps as the method reads and skips untimed ones', () => {
    const steps = timedSteps(recipeById('shaking-beef'))
    expect(steps.map((s) => s.number)).toEqual([1, 4, 5])
    expect(steps[1]?.timers.map((t) => t.text)).toEqual(['2 to 3 minutes'])
  })

  it('is empty for a recipe with no times', () => {
    expect(timedSteps(recipeById('greek-salad-haloumi'))).toEqual([])
  })
})

describe('prepPlan', () => {
  it('lists prep for picked recipes only, earliest first then by name', () => {
    const plan = prepPlan(
      entriesOf('shaking-beef', 'dahl', 'greek-salad-haloumi')
    )
    expect(plan.map((p) => `${p.daysBefore} ${p.recipe.id}`)).toEqual([
      '1 dahl',
      '1 shaking-beef'
    ])
  })

  it('puts a longer lead first', () => {
    const table: CookTable = {
      ...COOK,
      prepAhead: new Map([
        ['dahl', [{ daysBefore: 1, task: 'a' }]],
        ['shaking-beef', [{ daysBefore: 3, task: 'b' }]]
      ])
    }
    expect(
      prepPlan(entriesOf('dahl', 'shaking-beef'), table).map((p) => p.task)
    ).toEqual(['b', 'a'])
  })

  it('is empty when nothing picked needs it', () => {
    expect(prepPlan(entriesOf('greek-salad-haloumi'))).toEqual([])
  })
})

describe('days', () => {
  it('accepts only real calendar days as text', () => {
    expect(parseDay('2026-11-05')).toBe('2026-11-05')
    expect(parseDay('2026-02-30')).toBeNull()
    expect(parseDay('2026-13-01')).toBeNull()
    expect(parseDay('5 Nov 2026')).toBeNull()
    expect(parseDay(20261105)).toBeNull()
    expect(parseDay('')).toBeNull()
  })

  it('adds and subtracts days across month, year and leap days', () => {
    expect(addDays('2026-11-05', 3)).toBe('2026-11-08')
    expect(addDays('2026-11-05', -1)).toBe('2026-11-04')
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02')
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })
})

describe('sourcingFor', () => {
  it('gives a tip for each special ingredient on the list, once', () => {
    const tips = sourcingFor(entriesOf('rice-paper-rolls', 'shaking-beef'))
    expect(tips.map((t) => t.item.id)).toEqual(
      ['beef-rump', 'pork-belly', 'cooked-prawns', 'rice-paper'].sort(
        (a, b) =>
          catalogue.findIndex((i) => i.id === a) -
          catalogue.findIndex((i) => i.id === b)
      )
    )
    expect(tips.find((t) => t.item.id === 'pork-belly')?.tip).toMatch(
      /^Butcher/
    )
  })

  it('skips an ingredient the cook removed', () => {
    const [entry] = entriesOf('shaking-beef')
    const removed = newCopy('shaking-beef')
    const none = copyEntries([{ ...removed, amounts: { 'beef-rump': 0 } }])
    expect(entry).toBeDefined()
    expect(sourcingFor(none).map((t) => t.item.id)).not.toContain('beef-rump')
  })

  it('is empty when nothing picked has a tip', () => {
    expect(sourcingFor(entriesOf('greek-salad-haloumi'))).toEqual([])
  })
})

describe('weighing out', () => {
  const weighed = (id: string) =>
    entriesOf(id).flatMap((entry) =>
      weighOut(entry).map((w) => [w.line.ingredientId, w] as const)
    )
  const weigh = (id: string, ingredientId: string) =>
    new Map(weighed(id)).get(ingredientId)

  it('gives grams exactly when the recipe does', () => {
    const rump = weigh('shaking-beef', 'beef-rump')
    expect(rump?.exact).toBe(true)
    expect(rump?.amount).toEqual({ amount: 350, unit: 'g' })
  })

  it('estimates a count from the catalogue, and says it is an estimate', () => {
    const onion = weigh('spaghetti-bolognese', 'onion')
    expect(onion?.exact).toBe(false)
    expect(onion?.amount).toEqual({ amount: 75, unit: 'g' })
  })

  it('gives a measured amount in ml', () => {
    expect(weigh('butter-chicken', 'cream')?.amount).toEqual({
      amount: 62.5,
      unit: 'ml'
    })
  })

  it('has nothing for a line it cannot weigh', () => {
    const line = {
      ingredientId: 'x',
      name: 'x',
      item: null,
      quantity: 1,
      measure: 'g',
      original: null
    }
    expect(weightOf(line)).toBeNull()
    const item = catalogue.find((i) => i.id === 'salt')
    expect(
      weightOf({ ...line, item: item ?? null, measure: 'pinch' })
    ).toBeNull()
  })

  it('has nothing for a count with no weight in the catalogue', () => {
    const item = catalogue.find((i) => i.approxGrams === undefined)
    expect(item).toBeDefined()
    expect(
      weightOf({
        ingredientId: 'x',
        name: 'x',
        item: item ?? null,
        quantity: 2,
        measure: 'whole',
        original: null
      })
    ).toBeNull()
  })

  it('leaves out a removed line', () => {
    const copy = { ...newCopy('shaking-beef'), amounts: { 'beef-rump': 0 } }
    const ids = copyEntries([copy]).flatMap((entry) =>
      weighOut(entry).map((w) => w.line.ingredientId)
    )
    expect(ids).not.toContain('beef-rump')
    expect(ids).toContain('garlic')
  })
})

describe('labelsFor', () => {
  const summary = (...ids: string[]) =>
    labelsFor(entriesOf(...ids)).map(
      (l) => `${l.name}|${l.component?.id ?? 'dish'}|${l.days}`
    )

  it('keeps most dishes 3 days', () => {
    expect(summary('dahl')).toEqual([
      'Red lentil dahl|dish|3',
      'Red lentil dahl|basmati-rice|2'
    ])
  })

  it('labels the pasta in a bolognese for 2 days and the sauce dish for 3', () => {
    expect(summary('spaghetti-bolognese')).toEqual([
      'Spaghetti bolognese|dish|3',
      'Spaghetti bolognese|spaghetti|2'
    ])
  })

  it('gives a salad a shorter time of its own and no extra label', () => {
    expect(summary('greek-salad-haloumi')).toEqual([
      'Greek salad with haloumi|dish|1'
    ])
  })

  it('does not add a rice label when the whole dish is already 2 days', () => {
    expect(summary('egg-fried-rice')).toEqual(['Egg fried rice|dish|2'])
  })

  it('numbers a repeat the way the list does', () => {
    expect(summary('dahl', 'dahl').filter((s) => s.includes('|dish|'))).toEqual(
      ['Red lentil dahl|dish|3', 'Red lentil dahl (2)|dish|3']
    )
  })

  it('has none for an empty list', () => {
    expect(labelsFor([])).toEqual([])
  })
})

describe('the data file is the one the app reads', () => {
  it('has every prep task as text a person can read', () => {
    const tasks = Object.values(cookData.prepAhead).flatMap((steps) =>
      steps.map((s) => s.task)
    )
    expect(tasks.length).toBeGreaterThan(5)
    expect(tasks.every((t) => t.endsWith('.'))).toBe(true)
  })
})
