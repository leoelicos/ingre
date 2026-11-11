import { useStored } from '../storage/useStored'

/*
 * First run (#211): Landing (a hard stop) -> three TMD questions -> Explore. Where the
 * visitor got to is kept, so a reload resumes instead of starting again.
 */
export const FIRST_RUN_KEY = 'ingre.firstRun'

export const STAGES = ['landing', 'tmd', 'done'] as const
export type Stage = (typeof STAGES)[number]

/** A stored value as a stage, or null when it is not one. */
export const parseStage = (value: unknown): Stage | null =>
  STAGES.find((stage) => stage === value) ?? null

/** The stage the visitor is at, and a way to move to another. */
export const useFirstRun = (): {
  readonly stage: Stage
  readonly goTo: (stage: Stage) => void
} => {
  const [stage, update] = useStored<Stage>(FIRST_RUN_KEY, parseStage, 'landing')
  return { stage, goTo: (next) => update(() => next) }
}
