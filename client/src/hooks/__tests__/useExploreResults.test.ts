import { computeExploreData } from '../useExploreResults'
import { NO_RECIPE_FILTER } from '../../utils/filters/filters'
import { NO_PERSONAL } from '../../utils/profile/personal'

describe('computeExploreData', () => {
  const props = { savedOnly: false, personal: NO_PERSONAL }

  it('returns browse results for empty query', () => {
    const data = computeExploreData('', props, NO_RECIPE_FILTER, null)
    expect(data.results.kind).toBe('browse')
    expect(data.counts.recipes).toBeGreaterThanOrEqual(0)
    expect(typeof data.hidden).toBe('number')
  })

  it('returns match counts of zero for non-matching query', () => {
    const data = computeExploreData(
      'zzzznonexistent',
      props,
      NO_RECIPE_FILTER,
      null
    )
    expect(data.counts.ingredients).toBe(0)
    expect(data.counts.recipes).toBe(0)
  })
})
