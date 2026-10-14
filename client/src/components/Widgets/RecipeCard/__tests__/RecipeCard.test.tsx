import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RecipeCard from '../RecipeCard'
import { omit, recipe } from '../../../../test/fixtures'

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
          pick={null}
        />
      </MemoryRouter>
    )
    expect(screen.getByText('Test Recipe')).toBeInTheDocument()
  })

  it('picks by library id, falling back to the name', () => {
    const toggled: string[] = []
    const pick = {
      pickedIds: new Set(['Plain']),
      onToggle: (id: string) => {
        toggled.push(id)
      }
    }
    render(
      <MemoryRouter>
        <RecipeCard
          recipe={recipe({ libraryId: 'lib1' })}
          onSavedPage={false}
          pro={false}
          pick={pick}
        />
        <RecipeCard
          recipe={omit(recipe({ name: 'Plain' }), 'libraryId')}
          onSavedPage={false}
          pro={false}
          pick={pick}
        />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: /^\+ Add/ }))
    expect(screen.getByRole('button', { name: /Added Plain/ })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(toggled).toEqual(['lib1'])
  })
})
