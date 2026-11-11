import '@testing-library/jest-dom'
import { fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { IngredientPicture } from '../../../components/IngredientPicture'
import { IngredientNames } from '../IngredientNames'
import { catalogue } from '../../../utils/library/recipeLibrary'
import {
  chip,
  explore,
  extra,
  renderList,
  searchBox
} from '../../../test/renderList'
import { addFontAwesome } from '../../../utils/addFontAwesome'
import { EXTRAS_KEY } from '../../../utils/storage/shoppingState'

expect.extend(toHaveNoViolations)
addFontAwesome()

beforeEach(() => localStorage.clear())

/* Ingredient pictograms (#290) in Explore's rows and the chips: decorative and lazy. */

const pictures = (root: HTMLElement): HTMLImageElement[] =>
  Array.from(root.querySelectorAll('img[data-testid="ingredient-picture"]'))

describe('IngredientPicture', () => {
  it('is the catalogue SVG at the text size, hidden from assistive tech, and lazy', async () => {
    const { container } = render(
      <p>
        <IngredientPicture id="banana" /> Banana
      </p>
    )
    const [img] = pictures(container)
    expect(img).toHaveAttribute('src', '/ingredients/banana.svg')
    expect(img).toHaveAttribute('alt', '')
    expect(img).toHaveAttribute('aria-hidden', 'true')
    expect(img).toHaveAttribute('loading', 'lazy')
    expect(img).toHaveClass('h-[1.25em]', 'w-[1.25em]')
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Scenario: Explore and the chips show the ingredient picture', () => {
  it('an ingredient result shows its picture, and its name is unchanged', async () => {
    const user = userEvent.setup()
    renderList()
    await user.click(searchBox())
    await user.paste('banana')
    const add = explore().getAllByRole('button', { name: /^Add banana$/i })[0]!
    expect(pictures(add).map((img) => img.getAttribute('src'))).toEqual([
      '/ingredients/banana.svg'
    ])
    await user.click(add)
    expect(
      pictures(chip('banana')).map((img) => img.getAttribute('src'))
    ).toEqual(['/ingredients/banana.svg'])
  })

  it('each browse choice shows its picture and keeps its name', () => {
    renderList()
    fireEvent.click(
      explore().getByRole('button', { name: 'Browse ingredients' })
    )
    const apples = explore().getByRole('button', { name: 'Apples' })
    expect(pictures(apples)).toHaveLength(1)
    expect(pictures(apples)[0]).toHaveAttribute('src', '/ingredients/apple.svg')
  })

  it('a typed extra has no catalogue picture, so its chip shows none', () => {
    localStorage.setItem(
      EXTRAS_KEY,
      JSON.stringify([
        { id: 'x1', name: 'birthday candles', ingredientId: null, quantity: 2 }
      ])
    )
    renderList()
    extra()
    const candles = document.querySelector<HTMLElement>(
      '[data-scope="extra"][data-category="Other"]'
    )
    if (candles === null) throw new Error('no typed extra')
    expect(candles).toHaveTextContent('Birthday candles')
    expect(pictures(candles)).toEqual([])
  })

  it("a recipe row's ingredient chips show the picture, but not for a line with no catalogue item", () => {
    const garlic = catalogue.find((item) => item.id === 'garlic')!
    const line = { quantity: 1, measure: '', original: 1 }
    render(
      <IngredientNames
        title="Test"
        scroll={false}
        lines={[
          { ...line, ingredientId: 'garlic', name: 'garlic', item: garlic },
          { ...line, ingredientId: 'x1', name: 'candles', item: null }
        ]}
      />
    )
    const chips = document.querySelectorAll<HTMLElement>('[data-name-chip]')
    expect(pictures(chips[0]!).map((img) => img.getAttribute('src'))).toEqual([
      '/ingredients/garlic.svg'
    ])
    expect(chips[0]).toHaveTextContent(/^Garlic$/)
    expect(pictures(chips[1]!)).toEqual([])
  })
})
