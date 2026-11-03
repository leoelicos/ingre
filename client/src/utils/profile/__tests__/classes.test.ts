import { catalogue } from '../../library/recipeLibrary'
import {
  CLASSES,
  CLASS_OF,
  GROUPS,
  GROUP_OF,
  classOf,
  groupOf
} from '../classes'

describe('ingredient classes (#224)', () => {
  it('gives every catalogue ingredient a class, so none falls through to other', () => {
    expect(
      catalogue.filter((item) => classOf(item.id) === 'other').map((i) => i.id)
    ).toEqual([])
  })

  it('names no ingredient the catalogue does not hold', () => {
    const ids = new Set(catalogue.map((item) => item.id))
    expect(Object.keys(CLASS_OF).filter((id) => !ids.has(id))).toEqual([])
  })

  it('puts every class in a listed group, and every group has classes', () => {
    expect(CLASSES.every((c) => GROUPS.includes(groupOf(c)))).toBe(true)
    expect(
      GROUPS.filter((g) => !CLASSES.some((c) => groupOf(c) === g))
    ).toEqual([])
    expect(Object.keys(GROUP_OF).sort()).toEqual([...CLASSES].sort())
  })

  it('reads vegetables, proteins and carbs, with finer classes inside them', () => {
    expect(classOf('carrot')).toBe('root-vegetable')
    expect(groupOf(classOf('carrot'))).toBe('vegetables')
    expect(classOf('beef-mince')).toBe('beef')
    expect(groupOf(classOf('chicken-thigh'))).toBe('proteins')
    expect(groupOf(classOf('jasmine-rice'))).toBe('carbs')
  })

  it('calls anything outside the catalogue other', () => {
    expect(classOf('my free text')).toBe('other')
  })
})
