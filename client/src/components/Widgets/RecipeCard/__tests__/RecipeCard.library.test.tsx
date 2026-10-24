import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import {
  library,
  toClientRecipe
} from '../../../../utils/library/recipeLibrary'
import { addFontAwesome } from '../../../../utils/addFontAwesome'
import RecipeCard from '../RecipeCard'

addFontAwesome()

describe('RecipeCard with a library recipe', () => {
  it('draws the hero from the recipe ingredients and shows a local name, with no recipe page link (#181)', () => {
    const dahl = library
      .filter((r) => r.id === 'dahl' || r.id === 'shaking-beef')
      .map((r) => toClientRecipe(r))
    dahl.forEach((recipe) =>
      render(
        <MemoryRouter>
          <RecipeCard
            recipe={recipe}
            pro={false}
            pick={null}
          />
        </MemoryRouter>
      )
    )
    expect(
      screen.getByRole('heading', { name: 'Red lentil dahl' })
    ).toBeInTheDocument()
    expect(screen.queryByRole('link')).toBeNull()
  })
})
