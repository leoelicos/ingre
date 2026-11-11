import { formatClock, formatDayName } from '..'

/* t26u: history days and times come from Intl in the active locale (English here). */

describe('dates', () => {
  const at = new Date('2026-11-09T09:41:00').getTime()

  it('names a day with its weekday, date and month', () => {
    const name = formatDayName(at)
    expect(name).toMatch(/Monday/)
    expect(name).toMatch(/November/)
    expect(name).toMatch(/\b9\b/)
  })

  it('reads a time of day', () => {
    expect(formatClock(at)).toMatch(/^9:41\s?(am|AM)$/)
  })
})
