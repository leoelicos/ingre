import { catalogue } from '../../library/recipeLibrary'
import {
  FRIDGE_LARGE,
  POULTRY_IDS,
  RAW_IDS,
  hygieneNotes,
  subjectOf
} from '../hygiene'

const subject = (id: string, chilled = false) => ({ id, chilled })

describe('hygiene id lists', () => {
  it('only name catalogue ingredients', () => {
    const ids = catalogue.map((item) => item.id)
    expect(
      [...RAW_IDS, ...POULTRY_IDS].filter((id) => !ids.includes(id))
    ).toEqual([])
  })
  it('keep poultry inside the raw list', () => {
    expect(POULTRY_IDS.filter((id) => !RAW_IDS.includes(id))).toEqual([])
  })
  it('never treat cooked or ready-to-eat items as raw', () => {
    expect(RAW_IDS).not.toContain('cooked-prawns')
    expect(RAW_IDS).not.toContain('sliced-ham')
  })
  it('cover every raw meat in the catalogue', () => {
    const ready = ['cooked-prawns', 'sliced-ham', 'hummus']
    const raw = catalogue
      .filter((item) => ['meat', 'seafood', 'deli'].includes(item.category))
      .map((item) => item.id)
      .filter((id) => !ready.includes(id))
    expect(raw.filter((id) => !RAW_IDS.includes(id))).toEqual([])
  })
})

describe('hygieneNotes', () => {
  it('has nothing to say about a dry shop', () => {
    expect(hygieneNotes([subject('rice'), subject('flour')])).toEqual([])
    expect(hygieneNotes([])).toEqual([])
  })
  it('separates raw food, including eggs', () => {
    expect(hygieneNotes([subject('egg', true)])).toEqual([
      'separate',
      'storage'
    ])
  })
  it('adds the hand-wash note for raw chicken only', () => {
    expect(hygieneNotes([subject('chicken-thigh', true)])).toEqual([
      'separate',
      'handwash',
      'storage'
    ])
    expect(hygieneNotes([subject('beef-mince', true)])).not.toContain(
      'handwash'
    )
  })
  it('gives storage temperatures for anything chilled', () => {
    expect(hygieneNotes([subject('milk', true)])).toEqual(['storage'])
  })
  it('asks for a fridge check from a large chilled shop', () => {
    const many = Array.from({ length: FRIDGE_LARGE }, (_, i) =>
      subject(`item-${i}`, true)
    )
    expect(hygieneNotes(many)).toEqual(['storage', 'capacity'])
    expect(hygieneNotes(many.slice(1))).toEqual(['storage'])
  })
})

describe('subjectOf', () => {
  const [butter = null] = catalogue.filter((item) => item.id === 'butter')
  const [onion = null] = catalogue.filter((item) => item.id === 'onion')
  it('is chilled for a fridge item', () => {
    expect(subjectOf({ id: 'butter', item: butter })).toEqual({
      id: 'butter',
      chilled: true
    })
  })
  it('is not chilled for a cupboard or bench item', () => {
    expect(subjectOf({ id: 'onion', item: onion }).chilled).toBe(false)
  })
  it('is not chilled for free text', () => {
    expect(subjectOf({ id: 'free', item: null })).toEqual({
      id: 'free',
      chilled: false
    })
  })
})
