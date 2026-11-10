import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { NoMatch } from '../NoMatch'

const renderAt = () =>
  render(
    <MemoryRouter initialEntries={['/nowhere']}>
      <Routes>
        <Route
          path="/"
          element={<p>Home page</p>}
        />
        <Route
          path="*"
          element={<NoMatch />}
        />
      </Routes>
    </MemoryRouter>
  )

expect.extend(toHaveNoViolations)

describe('NoMatch', () => {
  it('renders page not found message', () => {
    renderAt()
    expect(screen.getByText(/page not found/i)).toBeInTheDocument()
    expect(document.title).toBe('ingré')
  })

  it('has one Go home control, not a button inside a link, with the shared focus ring (#106)', async () => {
    const { container } = renderAt()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    const home = screen.getByRole('button', { name: /go home/i })
    expect(home).toHaveClass('focus-visible:focus-ring')
    expect(home.closest('a')).toBeNull()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Go home goes to the home page', () => {
    renderAt()
    fireEvent.click(screen.getByRole('button', { name: /go home/i }))
    expect(screen.getByText('Home page')).toBeInTheDocument()
  })
})
