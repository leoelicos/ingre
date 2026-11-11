import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Carousel, scrollToSlide, slideIndex } from '../Carousel'

expect.extend(toHaveNoViolations)

const scrollTo = jest.fn()

beforeEach(() => {
  scrollTo.mockClear()
  HTMLElement.prototype.scrollTo = scrollTo
})

const renderIt = () =>
  render(
    <Carousel
      label="Tour"
      slides={[<p key="a">One</p>, <p key="b">Two</p>, <p key="c">Three</p>]}
    />
  )

const scrollTrackTo = (left: number) => {
  const el = screen.getAllByLabelText('Tour').find((e) => e.tabIndex === 0)
  if (el === undefined) throw new Error('no track')
  Object.defineProperty(el, 'clientWidth', { value: 300, configurable: true })
  Object.defineProperty(el, 'scrollLeft', { value: left, configurable: true })
  fireEvent.scroll(el)
}

describe('slideIndex', () => {
  it('rounds to the nearest card and stays in range', () => {
    expect(slideIndex(0, 300, 3)).toBe(0)
    expect(slideIndex(160, 300, 3)).toBe(1)
    expect(slideIndex(900, 300, 3)).toBe(2)
    expect(slideIndex(-50, 300, 3)).toBe(0)
  })
  it('is the first card while there is no width (jsdom, hidden)', () => {
    expect(slideIndex(500, 0, 3)).toBe(0)
  })
})

describe('scrollToSlide', () => {
  it('does nothing without a track', () => {
    scrollToSlide(null, 1)
    expect(scrollTo).not.toHaveBeenCalled()
  })
})

describe('Carousel (#211)', () => {
  it('is a labelled carousel of named slides, with the position written out', () => {
    renderIt()
    expect(screen.getByRole('region', { name: 'Tour' })).toHaveAttribute(
      'aria-roledescription',
      'carousel'
    )
    expect(
      screen.getByRole('group', { name: 'Card 1 of 3' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: 'Card 3 of 3' })
    ).toHaveTextContent('Three')
    expect(
      screen.getByText('Card 1 of 3', { selector: 'p' })
    ).toBeInTheDocument()
  })

  it('the scrolling area takes focus so the keyboard can scroll it', async () => {
    const user = userEvent.setup()
    renderIt()
    await user.tab()
    expect(
      screen.getAllByLabelText('Tour').find((e) => e.tabIndex === 0)
    ).toHaveFocus()
  })

  it('Previous is off on the first card and Next on the last', () => {
    renderIt()
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    scrollTrackTo(600)
    expect(
      screen.getByText('Card 3 of 3', { selector: 'p' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled()
  })

  it('Next and Previous scroll one card width, and never run by themselves', async () => {
    const user = userEvent.setup()
    renderIt()
    scrollTrackTo(0)
    expect(scrollTo).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 300 })
    scrollTrackTo(300)
    await user.click(screen.getByRole('button', { name: 'Previous' }))
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 0 })
  })

  it('scrolls smoothly, and not at all when motion is reduced (CSS decides)', () => {
    renderIt()
    const el = screen.getAllByLabelText('Tour').find((e) => e.tabIndex === 0)
    expect(el?.className).toContain('scroll-smooth')
    expect(el?.className).toContain('motion-reduce:scroll-auto')
  })

  it('has no axe violations', async () => {
    const { container } = renderIt()
    expect(await axe(container)).toHaveNoViolations()
  })
})
