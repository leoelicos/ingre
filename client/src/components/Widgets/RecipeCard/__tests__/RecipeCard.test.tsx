import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RecipeCard from '../RecipeCard'
import { omit, recipe } from '../../../../test/fixtures'

jest.mock('../components/SaveButton', () => ({
  SaveButton: () => <button>Save</button>
}))
describe('RecipeCard', () => {
  it('renders recipe name', () => {
    render(
      <MemoryRouter>
        <RecipeCard
          recipe={recipe({ name: 'Test Recipe' })}
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
          pro={false}
          pick={pick}
        />
        <RecipeCard
          recipe={omit(recipe({ name: 'Plain' }), 'libraryId')}
          pro={false}
          pick={pick}
        />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: /^Add .* to list$/ }))
    expect(
      screen.getByRole('button', { name: /^Remove Plain.* from list$/ })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(toggled).toEqual(['lib1'])
  })
})
