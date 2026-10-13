import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { EditButton } from '../EditButton'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}))

describe('EditButton', () => {
  it('renders edit button', () => {
    render(
      <MemoryRouter>
        <EditButton handleEdit={jest.fn()} loggedIn={true} />
      </MemoryRouter>
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
