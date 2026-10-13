import { useStored } from './useStored'

export type People = 1 | 2 | 3
export const PEOPLE_OPTIONS: readonly People[] = [1, 2, 3]
export const DEFAULT_PEOPLE: People = 2
export const PEOPLE_KEY = 'ingre.people'

export const parsePeople = (value: unknown): People | null =>
  PEOPLE_OPTIONS.find((option) => option === value) ?? null

/** Number of people to cook for, persisted so every page shares it. */
export const usePeople = (): [People, (people: People) => void] => {
  const [people, update] = useStored(PEOPLE_KEY, parsePeople, DEFAULT_PEOPLE)
  return [people, (next) => update(() => next)]
}
