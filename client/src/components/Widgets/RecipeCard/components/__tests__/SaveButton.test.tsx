import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SaveButton } from '../SaveButton'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
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
        <SaveButton {...defaultProps} savedRecipes={[{ edamamId: 'ed1' } as any]} />
      </MemoryRouter>
    )
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
