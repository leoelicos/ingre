import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RecipeCard from '../RecipeCard'
import { recipe } from '../../../../test/fixtures'

jest.mock('../useRecipeCard', () => ({
  useRecipeCard: () => ({
    handleSave: jest.fn(),
    handleRemove: jest.fn(),
    isSaved: false,
    isDisabled: false
  })
}))

jest.mock('../components/SaveButton', () => ({
  SaveButton: () => <button>Save</button>
}))
jest.mock('../components/TrashButton', () => ({
  TrashButton: () => <button>Delete</button>
}))

describe('RecipeCard', () => {
  it('renders recipe name', () => {
    render(
      <MemoryRouter>
        <RecipeCard
          recipe={recipe({ name: 'Test Recipe' })}
          onSavedPage={false}
          pro={false}
        />
      </MemoryRouter>
    )
    expect(screen.getByText('Test Recipe')).toBeInTheDocument()
  })
})
