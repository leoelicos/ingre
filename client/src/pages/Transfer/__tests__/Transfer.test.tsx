import '@testing-library/jest-dom'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { library } from '../../../utils/library/recipeLibrary'
import { IMPORTED_KEY, IMPORTED_PREFIX } from '../../../utils/transfer/storage'
import { pick } from '../../../test/renderList'
import { EXTRAS_KEY } from '../../../utils/storage/shoppingState'
import { exportRecipes } from '../../../utils/transfer/jsonld'
import { catalogue } from '../../../utils/library/recipeLibrary'
import { Transfer } from '../Transfer'

expect.extend(toHaveNoViolations)

/* #230: import and export. Downloads are captured at URL.createObjectURL. */

const blobs: Blob[] = []
const clicked: string[] = []

beforeAll(() => {
  URL.createObjectURL = (blob: Blob) => {
    blobs.push(blob)
    return 'blob:test'
  }
  URL.revokeObjectURL = () => {}
  HTMLAnchorElement.prototype.click = function click() {
    clicked.push(this.download)
  }
})

beforeEach(() => {
  localStorage.clear()
  blobs.length = 0
  clicked.length = 0
  library
    .filter((recipe) => recipe.id.startsWith(IMPORTED_PREFIX))
    .forEach((recipe) => library.splice(library.indexOf(recipe), 1))
})

const renderTransfer = () =>
  render(
    <MemoryRouter>
      <Transfer />
    </MemoryRouter>
  )

const textOf = (blob: Blob | undefined): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.readAsText(blob ?? new Blob())
  })

const SOUP = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Recipe',
  name: 'Lentil soup',
  recipeYield: '4',
  recipeIngredient: ['200 g red lentils', '1 brown onion', '2 unicorn horns'],
  recipeInstructions: ['Simmer.']
})

const paste = async (
  user: ReturnType<typeof userEvent.setup>,
  text: string
) => {
  await user.click(screen.getByLabelText('Or paste recipe JSON'))
  await user.paste(text)
  await user.click(screen.getByRole('button', { name: 'Import pasted recipe' }))
}

describe('Export (#230)', () => {
  it('has a heading, a way back and no accessibility violations', async () => {
    const { container } = renderTransfer()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Import and export' })
    ).toBeVisible()
    expect(
      screen.getByRole('link', { name: 'Back to your list' })
    ).toHaveAttribute('href', '/')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('exports every recipe as schema.org JSON-LD', async () => {
    const user = userEvent.setup()
    renderTransfer()
    await user.click(screen.getByRole('button', { name: 'All recipes' }))
    expect(clicked).toEqual(['ingre-all-recipes.json'])
    expect(blobs[0]?.type).toBe('application/ld+json')
    expect(await textOf(blobs[0])).toBe(exportRecipes(library, catalogue))
  })

  it('disables "Recipes on my list" and the CSV while nothing is picked', () => {
    renderTransfer()
    expect(
      screen.getByRole('button', { name: 'Recipes on my list' })
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Shopping list (CSV)' })
    ).toBeDisabled()
  })

  it('exports the picked recipes and the shopping list', async () => {
    const user = userEvent.setup()
    pick('dahl')
    renderTransfer()
    await user.click(screen.getByRole('button', { name: 'Recipes on my list' }))
    const exported: unknown = JSON.parse(await textOf(blobs[0]))
    expect(Array.isArray(exported) ? exported.length : 0).toBe(1)
    await user.click(
      screen.getByRole('button', { name: 'Shopping list (CSV)' })
    )
    expect(clicked).toEqual(['ingre-recipes.json', 'ingre-shopping-list.csv'])
    expect(blobs[1]?.type).toBe('text/csv')
    expect(await textOf(blobs[1])).toContain('Item,Quantity,Section')
  })

  it('exports the shopping list when only extras are on it', async () => {
    const user = userEvent.setup()
    localStorage.setItem(
      EXTRAS_KEY,
      JSON.stringify([
        { id: 'e', name: 'foil', ingredientId: null, quantity: 1 }
      ])
    )
    renderTransfer()
    await user.click(
      screen.getByRole('button', { name: 'Shopping list (CSV)' })
    )
    expect(await textOf(blobs[0])).toContain('foil,1 item,Other')
  })
})

describe('Import (#230)', () => {
  it('imports pasted JSON-LD, says what matched and what did not, and lists it', async () => {
    const user = userEvent.setup()
    renderTransfer()
    await paste(user, SOUP)
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Added Lentil soup: 2 of 3 ingredients.')
    expect(status).toHaveTextContent('Not matched: 2 unicorn horns')
    const list = within(
      screen.getByRole('region', { name: 'Imported recipes' })
    )
    expect(list.getByText('Lentil soup')).toBeVisible()
    expect(library.some((r) => r.id === 'imported-lentil-soup')).toBe(true)
  })

  it('keeps the imported recipe on this device', async () => {
    const user = userEvent.setup()
    renderTransfer()
    await paste(user, SOUP)
    expect(localStorage.getItem(IMPORTED_KEY)).toContain('Lentil soup')
  })

  it('does not add the same recipe twice', async () => {
    const user = userEvent.setup()
    renderTransfer()
    await paste(user, SOUP)
    await user.click(
      screen.getByRole('button', { name: 'Import pasted recipe' })
    )
    expect(library.filter((r) => r.id === 'imported-lentil-soup')).toHaveLength(
      1
    )
  })

  it('imports a chosen file', async () => {
    const user = userEvent.setup()
    const { container } = renderTransfer()
    const input =
      container.querySelector<HTMLInputElement>('input[type="file"]')
    if (input === null) throw new Error('no file input')
    await user.upload(
      // jsdom lets any File through; accept filtering is the browser's job
      input,
      new File([SOUP], 'soup.json', { type: 'application/json' })
    )
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Added Lentil soup')
    )
  })

  it('explains JSON that is not JSON, and JSON without a recipe', async () => {
    const user = userEvent.setup()
    renderTransfer()
    await paste(user, '{nope')
    expect(screen.getByRole('status')).toHaveTextContent(
      'That is not valid JSON.'
    )
    await user.clear(screen.getByLabelText('Or paste recipe JSON'))
    await paste(user, '{"@type":"Person"}')
    expect(screen.getByRole('status')).toHaveTextContent(
      'No schema.org Recipe found in that file.'
    )
  })

  it('names recipes it had to skip', async () => {
    const user = userEvent.setup()
    renderTransfer()
    await paste(
      user,
      JSON.stringify({
        '@type': 'Recipe',
        name: 'Moon cheese',
        recipeIngredient: ['1 moon']
      })
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'Not imported (no name or no ingredients we know): Moon cheese'
    )
  })

  it('disables Import pasted recipe while the box is empty', () => {
    renderTransfer()
    expect(
      screen.getByRole('button', { name: 'Import pasted recipe' })
    ).toBeDisabled()
  })
})

describe('Imported recipes (#230)', () => {
  it('says so when there are none', () => {
    renderTransfer()
    expect(screen.getByText('Nothing imported yet.')).toBeVisible()
  })

  it('removes an imported recipe, and only imported ones', async () => {
    const user = userEvent.setup()
    renderTransfer()
    await paste(user, SOUP)
    const built = library.length
    await user.click(screen.getByRole('button', { name: 'Remove Lentil soup' }))
    expect(library.some((r) => r.id === 'imported-lentil-soup')).toBe(false)
    expect(library.length).toBe(built - 1)
    expect(screen.getByText('Nothing imported yet.')).toBeVisible()
    expect(localStorage.getItem(IMPORTED_KEY)).toBe('[]')
  })
})
