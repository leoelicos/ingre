/** The old people setting (1 to 3); read once to migrate picks into copies (#182). */
export type People = 1 | 2 | 3
export const PEOPLE_OPTIONS: readonly People[] = [1, 2, 3]
export const PEOPLE_KEY = 'ingre.people'

export const parsePeople = (value: unknown): People | null =>
  PEOPLE_OPTIONS.find((option) => option === value) ?? null
