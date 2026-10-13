import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { TrashButton } from '../TrashButton'
import { recipe } from '../../../../../test/fixtures'

jest.mock('../../../../../lib/icon/Icon', () => ({
  IngreIconSpin: () => <div data-testid="spinner" />
}))

describe('TrashButton', () => {
  const defaultProps = {
    removeRecipeLoading: false,
    handleRemove: jest.fn(),
    savedRecipes: [recipe({ edamamId: 'ed1' })],
    edamamId: 'ed1'
  }

  it('renders delete button when recipe is saved', () => {
    render(<TrashButton {...defaultProps} />)
    expect(screen.getByRole('button')).toHaveTextContent('Delete')
    expect(screen.getByRole('button')).not.toBeDisabled()
  })

  it('shows spinner when loading', () => {
    render(
      <TrashButton
        {...defaultProps}
        removeRecipeLoading={true}
      />
    )
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('disables button when recipe is not saved', () => {
    render(
      <TrashButton
        {...defaultProps}
        savedRecipes={[]}
      />
    )
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
