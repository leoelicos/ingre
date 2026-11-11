import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NotLoggedIn from '../NotLoggedIn'

describe('NotLoggedIn', () => {
  it('renders login message and link', () => {
    render(
      <MemoryRouter>
        <NotLoggedIn />
      </MemoryRouter>
    )
    expect(screen.getByText(/need to be logged in/i)).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/login')
    /* the browser's thin default ring is not enough: the shared 3px ring (#106) */
    expect(screen.getByRole('link')).toHaveClass('focus-visible:focus-ring')
  })
})
