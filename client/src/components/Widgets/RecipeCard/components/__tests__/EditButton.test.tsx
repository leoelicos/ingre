import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { EditButton } from '../EditButton'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

describe('EditButton', () => {
  const handleEdit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders edit button', () => {
    render(
      <MemoryRouter>
        <EditButton handleEdit={handleEdit} loggedIn={true} />
      </MemoryRouter>
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('calls handleEdit and navigates when logged in', () => {
    render(
      <MemoryRouter>
        <EditButton handleEdit={handleEdit} loggedIn={true} />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(handleEdit).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/customise')
  })

  it('navigates to login when not logged in', () => {
    render(
      <MemoryRouter>
        <EditButton handleEdit={handleEdit} loggedIn={false} />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(handleEdit).not.toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })
})
