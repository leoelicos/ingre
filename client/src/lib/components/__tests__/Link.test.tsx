import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Link } from '../Link/Link'

describe('Link', () => {
  it('renders link with correct href', () => {
    render(
      <MemoryRouter>
        <Link to="/test">Test Link</Link>
      </MemoryRouter>
    )
    expect(screen.getByRole('link')).toHaveAttribute('href', '/test')
    expect(screen.getByRole('link')).toHaveTextContent('Test Link')
  })
})
