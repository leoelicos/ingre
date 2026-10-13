import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SaveButton } from '../SaveButton'
import { recipe } from '../../../../../test/fixtures'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

jest.mock('../../../../../lib/icon/Icon', () => ({
  IngreIconSpin: () => <div data-testid="spinner" />
}))

describe('SaveButton', () => {
  const defaultProps = {
    handleSave: jest.fn(),
    savedRecipes: [],
    saveRecipeLoading: false,
    edamamId: 'ed1',
    loggedIn: true
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders save button when not loading and not saved', () => {
    render(
      <MemoryRouter>
        <SaveButton {...defaultProps} />
      </MemoryRouter>
    )
    expect(screen.getByRole('button')).toHaveTextContent('Save')
    expect(screen.getByRole('button')).not.toBeDisabled()
  })

  it('shows spinner when loading', () => {
    render(
      <MemoryRouter>
        <SaveButton {...defaultProps} saveRecipeLoading={true} />
      </MemoryRouter>
    )
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('disables button when recipe is already saved', () => {
    render(
      <MemoryRouter>
        <SaveButton {...defaultProps} savedRecipes={[recipe({ edamamId: 'ed1' })]} />
      </MemoryRouter>
    )
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('navigates to login when not logged in and clicked', () => {
    render(
      <MemoryRouter>
        <SaveButton {...defaultProps} loggedIn={false} />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(mockNavigate).toHaveBeenCalledWith('/login')
    expect(defaultProps.handleSave).not.toHaveBeenCalled()
  })
})
