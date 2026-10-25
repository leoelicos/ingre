import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { resetViewport, setViewportWidth } from '../../../test/media'
import {
  DRAWER_MIN_WIDTH,
  SPLIT_MIN_WIDTH,
  WIDE_MIN_WIDTH,
  minWidthQuery,
  useMinWidth
} from '../useMinWidth'

const Probe = () => (
  <p>{`${useMinWidth(SPLIT_MIN_WIDTH)} ${useMinWidth(
    WIDE_MIN_WIDTH
  )} ${useMinWidth(DRAWER_MIN_WIDTH)}`}</p>
)

afterEach(resetViewport)

describe('useMinWidth (#181)', () => {
  it('builds the min-width query', () => {
    expect(minWidthQuery(576)).toBe('(min-width: 576px)')
  })

  it('is false where there is no matchMedia (mobile first)', () => {
    render(<Probe />)
    expect(screen.getByText('false false false')).toBeInTheDocument()
  })

  it('follows the viewport as it grows and shrinks, and stops listening on unmount', () => {
    setViewportWidth(575)
    const { unmount } = render(<Probe />)
    expect(screen.getByText('false false false')).toBeInTheDocument()
    setViewportWidth(576)
    expect(screen.getByText('true false false')).toBeInTheDocument()
    setViewportWidth(992)
    expect(screen.getByText('true true false')).toBeInTheDocument()
    setViewportWidth(991)
    expect(screen.getByText('true false false')).toBeInTheDocument()
    setViewportWidth(1327)
    expect(screen.getByText('true true false')).toBeInTheDocument()
    setViewportWidth(1328)
    expect(screen.getByText('true true true')).toBeInTheDocument()
    unmount()
    setViewportWidth(400)
  })
})
