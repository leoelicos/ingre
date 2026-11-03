import { catalogue } from '../../library/recipeLibrary'
import { ALLERGENS, PROFILES, buildProfiles } from '../corpus'

const byId = (id: string) => PROFILES.find((profile) => profile.id === id)

describe('the hand-curated corpus (#225)', () => {
  it('has one profile per catalogue ingredient, in catalogue order', () => {
    expect(PROFILES.map((profile) => profile.id)).toEqual(
      catalogue.map((item) => item.id)
    )
  })

  it('gives every profile classes, style tags and at least one partner', () => {
    PROFILES.forEach((profile) => {
      expect([profile.id, profile.classes.length > 0]).toEqual([
        profile.id,
        true
      ])
      expect([profile.id, profile.style.length > 0]).toEqual([profile.id, true])
      expect([profile.id, profile.goesWith.length > 0]).toEqual([
        profile.id,
        true
      ])
    })
  })

  it('points only at catalogue ingredients, never at itself', () => {
    const ids = new Set(PROFILES.map((profile) => profile.id))
    PROFILES.forEach((profile) => {
      profile.goesWith.forEach((other) => {
        expect(ids.has(other)).toBe(true)
        expect(other).not.toBe(profile.id)
      })
    })
  })

  it('knows a pairing both ways', () => {
    PROFILES.forEach((profile) => {
      profile.goesWith.forEach((other) => {
        expect(byId(other)?.goesWith).toContain(profile.id)
      })
    })
  })

  it('takes the allergens from the catalogue', () => {
    expect(byId('butter')?.allergens).toEqual(['milk'])
    expect(byId('carrot')?.allergens).toEqual([])
    expect(ALLERGENS).toContain('milk')
    expect([...ALLERGENS]).toEqual([...ALLERGENS].sort())
  })

  it('refuses a catalogue ingredient with no curated profile', () => {
    expect(() => buildProfiles([], catalogue)).toThrow(
      'No profile for beef-mince'
    )
  })

  it('symmetrises a pairing listed once', () => {
    const [first, second] = catalogue
    expect(first).toBeDefined()
    expect(second).toBeDefined()
    if (first === undefined || second === undefined) return
    const built = buildProfiles(
      [
        { id: first.id, classes: ['a'], style: ['b'], goesWith: [second.id] },
        { id: second.id, classes: ['a'], style: ['b'], goesWith: [] }
      ],
      [first, second]
    )
    expect(built.map((profile) => profile.goesWith)).toEqual([
      [second.id],
      [first.id]
    ])
  })
})
