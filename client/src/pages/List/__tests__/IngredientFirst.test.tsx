import '@testing-library/jest-dom'
import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import {
  explore,
  pickedIds,
  recipes,
  region,
  renderList,
  searchBox
} from '../../../test/renderList'

expect.extend(toHaveNoViolations)

beforeEach(() => localStorage.clear())

/* Acceptance for #204: ingredient-first core loop, in Explore. */

const CHOPS = 'Pork chops with apples and onion'
const browse = () =>
  fireEvent.click(explore().getByRole('button', { name: 'Browse ingredients' }))
/** Selects an ingredient from the browse list by its name. */
const choose = (name: string) =>
  fireEvent.click(
    within(
      document.getElementById('explore-browse-ingredients') ?? document.body
    ).getByRole('button', { name })
  )
const suggestions = () => within(region('Suggestions'))
const notes = () => screen.getAllByTestId('suggestion-note')

describe('Scenario: browse ingredients, select one or more (#204)', () => {
  it('offers Browse ingredients, closed at first, with every ingredient by shop section when opened', () => {
    renderList()
    const button = explore().getByRole('button', { name: 'Browse ingredients' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(
      document.getElementById('explore-browse-ingredients')
    ).not.toBeVisible()
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(
      explore().getByRole('heading', { level: 3, name: 'Fruit & Veg' })
    ).toBeVisible()
    expect(explore().getByRole('button', { name: 'Apples' })).toBeVisible()
  })

  it('shows no suggestions until something is selected', () => {
    renderList()
    expect(screen.queryByRole('region', { name: 'Suggestions' })).toBeNull()
  })

  it('selects several: a pressed toggle each, listed under Using, each with a way to take it out', () => {
    renderList()
    browse()
    choose('Apples')
    choose('Brown onion')
    expect(
      explore().getByRole('button', { name: 'Apples', pressed: true })
    ).toBeVisible()
    const using = suggestions().getByRole('list', { name: 'Using' })
    expect(within(using).getAllByRole('listitem')).toHaveLength(2)
    fireEvent.click(
      within(using).getByRole('button', { name: 'Stop using apples' })
    )
    expect(within(using).getAllByRole('listitem')).toHaveLength(1)
    expect(
      explore().getByRole('button', { name: 'Apples', pressed: false })
    ).toBeVisible()
  })

  it('also selects from search results with a Use button, beside Add', async () => {
    const user = userEvent.setup()
    renderList()
    await user.click(searchBox())
    await user.paste('apples')
    const use = explore().getByRole('button', { name: 'Use apples' })
    expect(use).toHaveAttribute('aria-pressed', 'false')
    expect(explore().getByRole('button', { name: 'Add apples' })).toBeVisible()
    await user.click(use)
    expect(use).toHaveAttribute('aria-pressed', 'true')
    expect(suggestions().getByText(CHOPS)).toBeVisible()
    expect(
      explore().queryByRole('button', { name: 'Browse ingredients' })
    ).toBeNull()
  })
})

describe('Scenario: suggestions say what is missing and what it costs (#204)', () => {
  it('apples and brown onion suggest pork chops: missing the chops and butter, about $14.00 more', () => {
    renderList()
    browse()
    choose('Apples')
    choose('Brown onion')
    const [first] = notes()
    expect(first).toHaveTextContent('Missing: pork loin chops, butter')
    expect(first).toHaveTextContent('About $14.00 more')
    expect(suggestions().getAllByRole('listitem').length).toBeGreaterThan(0)
  })

  it('shows at most three suggestions', () => {
    renderList()
    browse()
    choose('Garlic')
    expect(notes()).toHaveLength(3)
  })

  it('says so when everything is already selected', () => {
    renderList()
    browse()
    for (const name of ['Apples', 'Brown onion', 'Pork loin chops', 'Butter'])
      choose(name)
    expect(notes()[0]).toHaveTextContent('You have everything')
    expect(notes()[0]).toHaveTextContent('About $0.00 more')
  })

  it('says so when no recipe uses the selection', () => {
    renderList()
    browse()
    choose('Banana')
    expect(
      suggestions().getByText(
        'No recipes use these yet. Try another ingredient.'
      )
    ).toBeVisible()
  })
})

describe('Scenario: add to the list in one action, with an acknowledgement (#204)', () => {
  it('Add to list picks the recipe and says so inline; the note then reads On your list', () => {
    renderList()
    browse()
    choose('Apples')
    fireEvent.click(
      suggestions().getByRole('button', { name: `Add ${CHOPS} to your list` })
    )
    expect(pickedIds()).toEqual(['pork-chops-apple-onion'])
    expect(suggestions().getByRole('status')).toHaveTextContent(
      `${CHOPS} added to your list`
    )
    expect(recipes().getByRole('button', { name: CHOPS })).toBeVisible()
    expect(
      suggestions().queryByRole('button', { name: `Add ${CHOPS} to your list` })
    ).toBeNull()
    expect(notes()[0]).toHaveTextContent('✓ On your list')
  })

  it('the suggestion row still toggles like any recipe row', () => {
    renderList()
    browse()
    choose('Apples')
    fireEvent.click(suggestions().getByRole('button', { name: CHOPS }))
    expect(pickedIds()).toEqual(['pork-chops-apple-onion'])
  })
})

describe('Scenario: full recipe content stays opt-in (#204)', () => {
  it('shows no method until See recipe is pressed', () => {
    renderList()
    browse()
    choose('Apples')
    expect(suggestions().queryByText('Method')).toBeNull()
    fireEvent.click(
      suggestions().getByRole('button', { name: `See recipe: ${CHOPS}` })
    )
    expect(suggestions().getByText('Method')).toBeVisible()
  })
})

describe('Scenario: accessible (#204)', () => {
  it('has no axe violations with suggestions showing', async () => {
    const { container } = renderList()
    browse()
    choose('Apples')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('Use and Stop using work by keyboard', async () => {
    const user = userEvent.setup()
    renderList()
    await user.click(searchBox())
    await user.paste('apples')
    explore().getByRole('button', { name: 'Use apples' }).focus()
    await user.keyboard('{Enter}')
    suggestions().getByRole('button', { name: 'Stop using apples' }).focus()
    await user.keyboard(' ')
    expect(screen.queryByRole('region', { name: 'Suggestions' })).toBeNull()
  })
})
