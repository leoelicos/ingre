import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { focusMain, MAIN_ID, PageMain, SkipLink } from '../SkipLink'

expect.extend(toHaveNoViolations)

const Page = () => (
  <>
    <SkipLink />
    <header>
      <button type="button">Header control</button>
    </header>
    <PageMain>
      <button type="button">First in main</button>
    </PageMain>
  </>
)

describe('SkipLink (#131)', () => {
  it('is the first Tab stop, named "Skip to content", hidden until focused', async () => {
    const user = userEvent.setup()
    render(<Page />)
    const link = screen.getByRole('link', { name: 'Skip to content' })
    expect(link).toHaveAttribute('href', '#main')
    expect(link.className).toMatch(/\bsr-only\b/)
    expect(link.className).toMatch(/focus:not-sr-only/)
    expect(link.className).toMatch(/focus:focus-ring/)
    await user.tab()
    expect(link).toHaveFocus()
  })

  it('moves focus to #main; the next Tab reaches the first control in main', async () => {
    const user = userEvent.setup()
    render(<Page />)
    await user.tab()
    await user.keyboard('{Enter}')
    expect(document.getElementById(MAIN_ID)).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'First in main' })).toHaveFocus()
  })

  it('has no axe violations, focused or not', async () => {
    const user = userEvent.setup()
    const { container } = render(<Page />)
    expect(await axe(container)).toHaveNoViolations()
    await user.tab()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('PageMain is the one main landmark, focusable by script only, with the given classes', () => {
    render(<PageMain className="flex">content</PageMain>)
    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('id', MAIN_ID)
    expect(main).toHaveAttribute('tabindex', '-1')
    expect(main).toHaveClass('focus:outline-none', 'flex')
  })

  it('does nothing when the page has no main landmark', () => {
    document.body.innerHTML = '<button>outside</button>'
    focusMain(document)
    expect(document.body).toHaveFocus()
  })
})
