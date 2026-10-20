import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NoMatch } from '../NoMatch'

describe('NoMatch', () => {
  it('renders page not found message', () => {
    render(
      <MemoryRouter>
        <NoMatch />
      </MemoryRouter>
    )
    expect(screen.getByText(/page not found/i)).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/')
    expect(document.title).toBe('ingré')
  })
})
