import { itemById, recipeById } from '../../../test/library'
import { catalogue } from '../../library/recipeLibrary'
import {
  DEFAULT_PORTIONS,
  addedMeasure,
  clampPortions,
  copyLines,
  customisationBullets,
  customisationsOf,
  isCustomisedIn,
  newCopy,
  resetCopy,
  saveInput,
  usedLines,
  withAmount,
  withPortions
} from '../copies'

const chicken = recipeById('butter-chicken')
const dahl = recipeById('dahl')
const lineOf = (
  lines: ReturnType<typeof copyLines>,
  id: string
): ReturnType<typeof copyLines>[number] => {
  const found = lines.find((l) => l.ingredientId === id)
  if (found === undefined) throw new Error(`no line ${id}`)
  return found
}

describe('Feature: Portions per recipe copy (#182)', () => {
  it('Scenario: A new copy serves 2', () => {
    expect(newCopy('dahl')).toEqual({
      recipeId: 'dahl',
      portions: DEFAULT_PORTIONS,
      amounts: {}
    })
  })

  it('Scenario: Portions range: whole numbers from 1 to 12', () => {
    expect(clampPortions(0)).toBe(1)
    expect(clampPortions(13)).toBe(12)
    expect(clampPortions(3.6)).toBe(4)
    expect(clampPortions(Number.NaN)).toBe(2)
    expect(withPortions(newCopy('dahl'), 40).portions).toBe(12)
  })

  it('Scenario: Edits scale with portions', () => {
    const added = withAmount(
      newCopy('butter-chicken'),
      chicken,
      'red-chilli',
      1
    )
    const four = withPortions(added, 4)
    expect(
      lineOf(copyLines(chicken, four, catalogue), 'red-chilli').quantity
    ).toBe(2)
    expect(lineOf(copyLines(chicken, four, catalogue), 'butter').quantity).toBe(
      50
    )
  })
})

describe('copy lines', () => {
  it('lists the originals at the copy portions, then added items in their base measure', () => {
    const copy = withAmount(newCopy('butter-chicken'), chicken, 'cheddar', 100)
    const lines = copyLines(chicken, copy, catalogue)
    expect(lines).toHaveLength(chicken.ingredients.length + 1)
    expect(lineOf(lines, 'butter')).toMatchObject({
      name: 'butter',
      quantity: 25,
      measure: 'g',
      original: 25
    })
    expect(lineOf(lines, 'cheddar')).toMatchObject({
      quantity: 100,
      measure: 'g',
      original: null
    })
    expect(addedMeasure(itemById('red-chilli'))).toBe('whole')
    expect(addedMeasure(itemById('cream'))).toBe('ml')
    expect(addedMeasure(null)).toBe('whole')
  })

  it('names an unknown item by its id', () => {
    const lines = copyLines(dahl, newCopy('dahl'), [])
    expect(lineOf(lines, 'butter')).toMatchObject({
      name: 'butter',
      item: null
    })
  })

  it('keeps removed items at 0, and usedLines leaves them out', () => {
    const copy = withAmount(newCopy('dahl'), dahl, 'butter', 0)
    const lines = copyLines(dahl, copy, catalogue)
    expect(lineOf(lines, 'butter').quantity).toBe(0)
    expect(usedLines(lines).map((l) => l.ingredientId)).not.toContain('butter')
  })
})

describe('Feature: Recipe copies and customisations (#182)', () => {
  it('Scenario: The list shows current differences only', () => {
    const changed = withAmount(
      newCopy('butter-chicken'),
      chicken,
      'butter',
      37.5
    )
    expect(isCustomisedIn(changed, 'butter')).toBe(true)
    const back = withAmount(changed, chicken, 'butter', 25)
    expect(back.amounts).toEqual({})
    const added = withAmount(back, chicken, 'red-chilli', 1)
    expect(withAmount(added, chicken, 'red-chilli', 0).amounts).toEqual({})
    expect(withAmount(back, chicken, 'butter', -3).amounts).toEqual({
      butter: 0
    })
  })

  it('Scenario: Customisations as bullet points, in recipe units', () => {
    let copy = withAmount(newCopy('butter-chicken'), chicken, 'red-chilli', 1)
    copy = withAmount(copy, chicken, 'butter', 0)
    copy = withAmount(copy, chicken, 'cream', 0.5)
    copy = withPortions(copy, 4)
    const lines = copyLines(chicken, copy, catalogue)
    expect(customisationBullets(lines, copy)).toEqual([
      'Added red chilli 2 chillies',
      'Butter removed',
      'Thickened cream ½ cup → 1 cup',
      'Portions 2 → 4'
    ])
    const plain = withAmount(newCopy('butter-chicken'), chicken, 'butter', 37.5)
    expect(
      customisationBullets(copyLines(chicken, plain, catalogue), plain)
    ).toEqual(['Butter 25 g → 37.5 g'])
  })

  it('Scenario: Refresh undoes customisations and portions', () => {
    const copy = withPortions(withAmount(newCopy('dahl'), dahl, 'butter', 0), 5)
    expect(resetCopy(copy)).toEqual(newCopy('dahl'))
  })
})

describe('Feature: Saving a customised recipe (#182)', () => {
  it('Scenario: Saving sends customisations, rounded to 2 decimals, with catalogue ids', () => {
    let copy = withAmount(newCopy('butter-chicken'), chicken, 'red-chilli', 1)
    copy = withAmount(copy, chicken, 'butter', 0)
    copy = withAmount(copy, chicken, 'garlic', 1 / 3)
    const input = saveInput(chicken, copy, catalogue)
    expect(input).toMatchObject({
      name: chicken.name,
      portions: 2,
      picture_url: '/ingre.png',
      libraryId: 'butter-chicken',
      customisations: {
        added: [{ ingredientId: 'red-chilli', to: 1 }],
        removed: [{ ingredientId: 'butter', from: 25 }],
        changed: [{ ingredientId: 'garlic', from: 1.5, to: 0.33 }]
      }
    })
    expect(input.customisations?.portions).toBeUndefined()
    expect(input.ingredients.map((i) => i.ingredientId)).not.toContain('butter')
    expect(input.ingredients[0]).toEqual({
      name: 'chicken thigh fillets',
      quantity: 350,
      measure: 'g',
      category: 'meat',
      ingredientId: 'chicken-thigh'
    })
    const unknown = saveInput(
      { ...chicken, picture_url: '/pic.jpg' },
      withPortions(newCopy('butter-chicken'), 3),
      []
    )
    expect(unknown.picture_url).toBe('/pic.jpg')
    expect(unknown.ingredients[0]?.category).toBe('other')
    expect(
      customisationsOf([], withPortions(newCopy('x'), 3)).portions
    ).toEqual({
      from: 2,
      to: 3
    })
  })
})
