import { act, renderHook } from '@testing-library/react'
import {
  NO_SETTINGS,
  SETTINGS_KEY,
  parseSettings,
  useProfileSettings
} from '../settings'

describe('profile settings (#224)', () => {
  beforeEach(() => localStorage.clear())

  it('reads likes, dislikes, allergens and diet', () => {
    expect(
      parseSettings({
        likes: ['beef'],
        dislikes: ['allium'],
        allergens: ['milk'],
        diet: 'vegan'
      })
    ).toEqual({
      likes: ['beef'],
      dislikes: ['allium'],
      allergens: ['milk'],
      diet: 'vegan'
    })
  })

  it('drops anything unreadable, never turning a bad entry into a lock or a like', () => {
    expect(
      parseSettings({
        likes: ['beef', 'bogus', 4],
        dislikes: 'allium',
        allergens: ['milk', '', 3],
        diet: 'carnivore'
      })
    ).toEqual({
      likes: ['beef'],
      dislikes: [],
      allergens: ['milk'],
      diet: 'none'
    })
    expect(parseSettings({})).toEqual(NO_SETTINGS)
    expect(parseSettings([])).toBeNull()
    expect(parseSettings('x')).toBeNull()
    expect(parseSettings(null)).toBeNull()
  })

  it('is stored on the device', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ diet: 'vegetarian' }))
    const { result } = renderHook(() => useProfileSettings())
    expect(result.current[0].diet).toBe('vegetarian')
    act(() =>
      result.current[1]((settings) => ({ ...settings, likes: ['cheese'] }))
    )
    expect(
      JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}')
    ).toMatchObject({ likes: ['cheese'], diet: 'vegetarian' })
  })

  it('has no settings until set', () => {
    const { result } = renderHook(() => useProfileSettings())
    expect(result.current[0]).toEqual(NO_SETTINGS)
  })
})
