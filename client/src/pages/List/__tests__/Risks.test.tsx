import '@testing-library/jest-dom'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { pick, region, renderList, toggleOf } from '../../../test/renderList'
import { recipeById } from '../../../test/library'
import { setViewportWidth, resetViewport } from '../../../test/media'
import { copyLines, newCopy } from '../../../utils/balance/copies'
import { catalogue } from '../../../utils/library/recipeLibrary'
import { RISK_SETTINGS_KEY } from '../../../utils/risks/riskSettings'
import { AlternativeNote, OvenResult, flagCount } from '../Risks'

expect.extend(toHaveNoViolations)

/* #220 Risk handling: the Risks section on the list page. */

beforeEach(() => localStorage.clear())
afterEach(resetViewport)

const risks = () => within(region('Risks'))
const risk = (name: string) =>
  within(
    risks().getByRole('heading', { level: 3, name }).parentElement ??
      document.body
  )
type User = ReturnType<typeof userEvent.setup>
const setBox = async (user: User, name: string, value: string) => {
  const box = risks().getByRole('textbox', { name })
  await user.clear(box)
  await user.type(box, value)
  await user.tab()
}
const entryOf = (id: string) => ({
  recipe: recipeById(id),
  lines: copyLines(recipeById(id), newCopy(id), catalogue)
})

describe('Risks section (#220)', () => {
  it('is not on the page until a recipe is picked', () => {
    renderList()
    expect(screen.queryByRole('region', { name: 'Risks' })).toBeNull()
  })

  it('shows the five risks, and nothing to check while no limit is set', () => {
    pick('butter-chicken')
    renderList()
    expect(
      risks()
        .getAllByRole('heading', { level: 3 })
        .map((h) => h.textContent)
    ).toEqual([
      'If the shop is out of something',
      'If you cannot get to a shop',
      'Budget',
      'Fridge space',
      'If the oven fails'
    ])
    expect(risks().getByText('Nothing to check')).toBeInTheDocument()
  })

  it('offers a substitute for each ingredient with one, and says when there is none', () => {
    pick('rice-paper-rolls', 'butter-chicken')
    renderList()
    const out = risk('If the shop is out of something')
    expect(
      out.getByText('Butter: use ghee, or a neutral oil.')
    ).toBeInTheDocument()
    expect(
      out.getByText('Rice paper sheets: no good substitute, so buy it first.')
    ).toBeInTheDocument()
  })

  it('says plainly when nothing has a fallback', () => {
    pick('egg-fried-rice')
    renderList()
    expect(
      risk('If the shop is out of something').getByText(
        'Nothing on your list has a ready fallback.'
      )
    ).toBeInTheDocument()
  })

  it('says what is still to get for each recipe, and which other recipe is closest', () => {
    pick('dahl', 'butter-chicken')
    renderList()
    const access = risk('If you cannot get to a shop')
    expect(
      access.getByText(/^Red lentil dahl: \d+ items still to get\.$/)
    ).toBeInTheDocument()
    expect(
      access.getByText(/^Butter chicken: \d+ items still to get\.$/)
    ).toBeInTheDocument()
    expect(access.getByText(/^Cross items off Ingredients/)).toBeInTheDocument()
  })

  it('counts an ingredient once it is crossed off, down to ready to cook', async () => {
    const user = userEvent.setup()
    pick('pork-chops-apple-onion')
    renderList()
    const access = risk('If you cannot get to a shop')
    expect(
      access.getByText(
        'Pork chops with apples and onion: 4 items still to get.'
      )
    ).toBeInTheDocument()
    for (const id of ['pork-loin-chop', 'apple', 'onion', 'butter'])
      await user.click(toggleOf(id))
    expect(
      access.getByText(
        'Pork chops with apples and onion: you have everything to cook it.'
      )
    ).toBeInTheDocument()
    expect(access.queryByText(/^Cross items off/)).toBeNull()
  })

  it('names the closest recipe not picked, ready to cook, or none', () => {
    pick('dahl')
    renderList()
    const access = risk('If you cannot get to a shop')
    expect(
      access.getByText('No other recipe in the library is within three items.')
    ).toBeInTheDocument()
    const { rerender } = render(<AlternativeNote alternative={null} />)
    const other = { recipe: recipeById('butter-chicken'), missing: 2 }
    rerender(<AlternativeNote alternative={other} />)
    expect(
      screen.getByText('Closest other recipe: Butter chicken (2 more).')
    ).toBeInTheDocument()
    rerender(<AlternativeNote alternative={{ ...other, missing: 0 }} />)
    expect(
      screen.getByText(
        'Closest other recipe: Butter chicken, which you could cook now.'
      )
    ).toBeInTheDocument()
  })

  it('checks the list against a budget the user sets, and keeps it', async () => {
    const user = userEvent.setup()
    pick('butter-chicken')
    renderList()
    const budget = risk('Budget')
    expect(
      budget.getByText('Set a budget to check the list against it.')
    ).toBeInTheDocument()
    await setBox(user, 'Budget for this shop, in dollars', '1')
    expect(
      budget.getByText(
        /^Check: Over budget by \$\d+\.\d\d: about \$\d+\.\d\d against \$1\.00\.$/
      )
    ).toBeInTheDocument()
    expect(
      budget.getByText(/^Dropping Butter chicken saves about \$\d+\.\d\d\.$/)
    ).toBeInTheDocument()
    expect(risks().getByText('1 to check')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(RISK_SETTINGS_KEY) ?? '{}')).toEqual(
      {
        budget: 1,
        fridge: null
      }
    )
    await setBox(user, 'Budget for this shop, in dollars', '500')
    expect(
      budget.getByText(/^Within budget: about \$\d+\.\d\d of \$500\.00\.$/)
    ).toBeInTheDocument()
    expect(risks().getByText('Nothing to check')).toBeInTheDocument()
  })

  it('unsets a limit when its box is cleared', async () => {
    const user = userEvent.setup()
    localStorage.setItem(
      RISK_SETTINGS_KEY,
      JSON.stringify({ budget: 5, fridge: 2 })
    )
    pick('butter-chicken')
    renderList()
    const box = risks().getByRole('textbox', {
      name: 'Budget for this shop, in dollars'
    })
    expect(box).toHaveValue('5')
    await user.clear(box)
    await user.tab()
    expect(
      risk('Budget').getByText('Set a budget to check the list against it.')
    ).toBeInTheDocument()
  })

  it('checks the chilled food against the fridge space', async () => {
    const user = userEvent.setup()
    pick('butter-chicken')
    renderList()
    const fridge = risk('Fridge space')
    expect(fridge.getByText(/^Set your free fridge space/)).toBeInTheDocument()
    expect(fridge.getByText(/^A rough estimate/)).toBeInTheDocument()
    await setBox(user, 'Free fridge space, in litres', '0.1')
    expect(
      fridge.getByText(
        /^Check: Too much for the fridge: about [\d.]+ L of chilled food in 0\.1 L, [\d.]+ L over\.$/
      )
    ).toBeInTheDocument()
    await setBox(user, 'Free fridge space, in litres', '30')
    expect(
      fridge.getByText(/^Fits: about [\d.]+ L of chilled food in 30 L\.$/)
    ).toBeInTheDocument()
  })

  it('says nothing on the list needs the oven', () => {
    pick('butter-chicken')
    renderList()
    expect(
      risk('If the oven fails').getByText(
        'Nothing on your list needs the oven.'
      )
    ).toBeInTheDocument()
  })

  it('names the recipes that need the oven, and what to do instead', () => {
    const roast = {
      recipe: { ...recipeById('dahl'), method: ['Roast the lentils.'] },
      lines: []
    }
    render(<OvenResult picked={[roast, entryOf('butter-chicken')]} />)
    expect(
      screen.getByText(
        'Check: Red lentil dahl need the oven. If it fails, finish on the hob in a covered pan, or use a grill or air fryer.'
      )
    ).toBeInTheDocument()
  })

  it('counts the failing checks: budget, fridge and oven', () => {
    const list = [entryOf('butter-chicken')]
    expect(flagCount(list, null, null)).toBe(0)
    expect(flagCount(list, 1, 0.1)).toBe(2)
    expect(flagCount(list, 1000, 1000)).toBe(0)
  })

  it('collapses to its header on a phone, like the other sections', () => {
    setViewportWidth(390)
    pick('butter-chicken')
    renderList()
    const header = screen.getByRole('button', { name: /^Risks/ })
    fireEvent.click(header)
    expect(header).toHaveAttribute('aria-expanded', 'false')
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Budget' })
    ).toBeNull()
  })

  it('has no axe violations', async () => {
    pick('butter-chicken')
    const { container } = renderList()
    expect(await axe(container)).toHaveNoViolations()
  })
})
