import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RecipeCard from '../RecipeCard'

jest.mock('../useRecipeCard', () => ({
  useRecipeCard: () => ({
    handleEdit: jest.fn(),
    handleSave: jest.fn(),
    handleRemove: jest.fn(),
    isSaved: false,
    isDisabled: false
  })
}))

jest.mock('../components/EditButton', () => ({ EditButton: () => <button>Edit</button> }))
jest.mock('../components/SaveButton', () => ({ SaveButton: () => <button>Save</button> }))
jest.mock('../components/TrashButton', () => ({ TrashButton: () => <button>Delete</button> }))

const mockRecipe = {
  _id: '1',
  name: 'Test Recipe',
  portions: '4',
  picture_url: 'http://example.com/img.jpg',
  edamamId: 'ed1',
  instructions: 'Cook it'
}

describe('RecipeCard', () => {
  it('renders recipe name', () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={mockRecipe} onSavedPage={false} pro={false} />
      </MemoryRouter>
    )
    expect(screen.getByText('Test Recipe')).toBeInTheDocument()
  })
})
