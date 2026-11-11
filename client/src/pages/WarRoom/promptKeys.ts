import { PROMPTS } from '../../utils/warroom/prompts'

/** The examples from `start`, round the end, `count` of them. */
export const promptKeys = (start: number, count: number): string[] =>
  [...PROMPTS.slice(start), ...PROMPTS.slice(0, start)]
    .slice(0, count)
    .map(({ key }) => key)
