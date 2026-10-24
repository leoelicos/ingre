import { render, screen } from '@testing-library/react'
import type { FC } from 'react'
import { useT } from '..'
import { i18n, locale, translateOr } from '../i18n'

const Probe: FC<{ count: number }> = ({ count }) => {
  const t = useT()
  return (
    <p>
      {t('filter.button')} / {t('filter.hidden', { count })}
    </p>
  )
}

describe('useT, the wrapper components translate through', () => {
  it('returns the active locale’s messages, with values filled in', () => {
    render(<Probe count={2} />)
    expect(screen.getByText('Filter / 2 hidden by filter')).toBeTruthy()
  })

  it('English is the locale, synchronously ready at import', () => {
    expect(locale()).toBe('en')
    expect(i18n.isInitialized).toBe(true)
  })

  it('a missing key falls back to the given text', () => {
    expect(translateOr('measure.pinch', 'pinch')).toBe('pinch')
    expect(translateOr('measure.cup', 'x', { count: 2 })).toBe('cups')
  })
})
