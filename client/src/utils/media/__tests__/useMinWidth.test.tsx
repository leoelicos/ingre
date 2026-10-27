import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { resetViewport, setViewportWidth } from '../../../test/media'
import { DESKTOP_MIN_WIDTH, minWidthQuery, useMinWidth } from '../useMinWidth'

const Probe = () => <p>{`${useMinWidth(DESKTOP_MIN_WIDTH)}`}</p>

afterEach(resetViewport)

describe('useMinWidth (#192)', () => {
  it('builds the min-width query', () => {
    expect(minWidthQuery(576)).toBe('(min-width: 576px)')
  })

  it('is false where there is no matchMedia (mobile first)', () => {
    render(<Probe />)
    expect(screen.getByText('false')).toBeInTheDocument()
  })

  it('is desktop from exactly 576px, follows resizes, and stops listening on unmount', () => {
    setViewportWidth(575)
    const { unmount } = render(<Probe />)
    expect(screen.getByText('false')).toBeInTheDocument()
    setViewportWidth(576)
    expect(screen.getByText('true')).toBeInTheDocument()
    setViewportWidth(575)
    expect(screen.getByText('false')).toBeInTheDocument()
    unmount()
    setViewportWidth(400)
  })
})
