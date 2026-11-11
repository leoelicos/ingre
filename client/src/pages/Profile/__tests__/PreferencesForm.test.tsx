import '@testing-library/jest-dom'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { APPEARANCE_KEY, THEMES } from '../../../utils/preferences/appearance'
import { SETTINGS_KEY } from '../../../utils/profile/settings'
import {
  ALLERGEN_FAMILIES,
  PreferencesForm,
  dietLabel,
  themeLabel
} from '../PreferencesForm'

expect.extend(toHaveNoViolations)

const root = document.documentElement
const form = () => screen.getByRole('form', { name: 'Preferences' })
const group = (name: string) => screen.getByRole('group', { name })
const textSize = () => screen.getByRole('textbox', { name: 'Text size' })
const save = () => screen.getByRole('button', { name: 'Save preferences' })
const status = () => within(form()).getByRole('status')
const summary = () =>
  screen.queryByRole('heading', { name: 'There is a problem' })?.parentElement

const setup = () => {
  const user = userEvent.setup()
  const view = render(<PreferencesForm />)
  return { user, view }
}

beforeAll(() => {
  Element.prototype.scrollIntoView = () => undefined
})

beforeEach(() => {
  localStorage.clear()
  delete root.dataset['theme']
  root.style.fontSize = ''
})

describe('Preferences form: structure', () => {
  it('is a named form of labelled groups, each choice a native control', () => {
    setup()
    expect(form()).toBeInTheDocument()
    expect(
      within(group('Appearance')).getByRole('group', { name: 'Colour theme' })
    ).toBeInTheDocument()
    expect(
      within(group('Colour theme'))
        .getAllByRole('radio')
        .map((radio) => radio.getAttribute('value'))
    ).toEqual(['system', 'light', 'dark'])
    expect(
      within(group('Recipes')).getByRole('group', { name: 'Diet' })
    ).toHaveAccessibleDescription('Explore hides recipes that do not fit.')
    expect(group('Allergens to avoid')).toHaveAccessibleDescription(
      'Explore hides recipes that contain any you tick.'
    )
    expect(
      within(group('Allergens to avoid')).getAllByRole('checkbox')
    ).toHaveLength(ALLERGEN_FAMILIES.length)
    expect(ALLERGEN_FAMILIES).toEqual([
      'crustacean',
      'egg',
      'fish',
      'gluten',
      'lupin',
      'milk',
      'mollusc',
      'peanut',
      'sesame',
      'soy',
      'tree nut',
      'wheat'
    ])
    expect(screen.getByRole('checkbox', { name: 'Tree nut' })).not.toBeChecked()
  })

  it('starts from what is stored, or the standard values', () => {
    setup()
    expect(screen.getByRole('radio', { name: 'Match my device' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'No diet' })).toBeChecked()
    expect(textSize()).toHaveValue('100')
    expect(textSize()).toHaveAccessibleDescription(
      'A whole number from 100 to 200. 100 is the standard size.'
    )
    expect(textSize()).toHaveAttribute('aria-invalid', 'false')
    expect(textSize()).toHaveAttribute('inputmode', 'numeric')
  })

  it('reads stored preferences', () => {
    localStorage.setItem(
      APPEARANCE_KEY,
      JSON.stringify({ theme: 'light', textSize: 150 })
    )
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ diet: 'vegan', allergens: ['sesame'] })
    )
    setup()
    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Vegan' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Sesame' })).toBeChecked()
    expect(textSize()).toHaveValue('150')
  })

  it('labels every theme and diet in words', () => {
    expect(THEMES.map(themeLabel)).toEqual(['Match my device', 'Light', 'Dark'])
    expect(
      (['none', 'pescatarian', 'vegetarian', 'vegan'] as const).map(dietLabel)
    ).toEqual(['No diet', 'Pescatarian', 'Vegetarian', 'Vegan'])
  })
})

describe('Preferences form: inline validation', () => {
  it('waits until the field is left, then checks as you fix it', async () => {
    const { user } = setup()
    await user.clear(textSize())
    await user.type(textSize(), '3')
    /* nothing while typing in a field not yet left */
    expect(textSize()).toHaveAttribute('aria-invalid', 'false')
    expect(screen.queryByText(/Enter a text size/)).toBeNull()

    await user.tab()
    expect(textSize()).toHaveAttribute('aria-invalid', 'true')
    expect(textSize()).toHaveAccessibleDescription(
      'A whole number from 100 to 200. 100 is the standard size. Error: Enter a text size from 100 to 200'
    )

    /* once left, the message follows each change */
    await user.type(textSize(), '00')
    expect(textSize()).toHaveValue('300')
    expect(textSize()).toHaveAttribute('aria-invalid', 'true')
    await user.clear(textSize())
    expect(textSize()).toHaveAccessibleDescription(/Error: Enter a text size$/)
    await user.type(textSize(), '1.5')
    expect(textSize()).toHaveAccessibleDescription(
      /Error: Enter the text size as a whole number, like 125$/
    )
    await user.clear(textSize())
    await user.type(textSize(), '150')
    expect(textSize()).toHaveAttribute('aria-invalid', 'false')
    expect(textSize()).toHaveAccessibleDescription(
      'A whole number from 100 to 200. 100 is the standard size.'
    )
  })
})

describe('Preferences form: submit', () => {
  it('stops on a problem: a focused summary links to the field, and nothing is saved', async () => {
    const { user } = setup()
    await user.clear(textSize())
    await user.click(save())
    const box = summary()
    expect(box).toHaveFocus()
    expect(box).toHaveAccessibleName('There is a problem')
    const link = within(box as HTMLElement).getByRole('link', {
      name: 'Enter a text size'
    })
    expect(link).toHaveAttribute('href', `#${textSize().id}`)
    expect(textSize()).toHaveAttribute('aria-invalid', 'true')
    expect(localStorage.getItem(APPEARANCE_KEY)).toBeNull()
    expect(status()).toBeEmptyDOMElement()

    await user.click(link)
    expect(textSize()).toHaveFocus()

    /* submitting again with the same problem brings focus back to the summary */
    await user.click(save())
    expect(summary()).toHaveFocus()

    /* fixed, the summary goes and the form saves */
    await user.type(textSize(), '120')
    expect(summary()).toBeUndefined()
    await user.click(save())
    expect(status()).toHaveTextContent('Preferences saved.')
  })

  it('saves, applies the theme and text size to the whole page, and says so politely', async () => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ likes: ['beef'], allergens: ['gluten (oats)'] })
    )
    const { user } = setup()
    await user.click(screen.getByRole('radio', { name: 'Dark' }))
    await user.clear(textSize())
    await user.type(textSize(), ' 125 %')
    await user.click(screen.getByRole('radio', { name: 'Vegetarian' }))
    await user.click(screen.getByRole('checkbox', { name: 'Milk' }))
    await user.click(screen.getByRole('checkbox', { name: 'Egg' }))
    await user.click(screen.getByRole('checkbox', { name: 'Egg' }))
    await user.click(save())

    expect(status()).toHaveTextContent('Preferences saved.')
    expect(status()).toHaveAttribute('role', 'status')
    expect(root.dataset['theme']).toBe('dark')
    expect(root.style.fontSize).toBe('20px')
    expect(textSize()).toHaveValue('125')
    expect(JSON.parse(localStorage.getItem(APPEARANCE_KEY) ?? '{}')).toEqual({
      theme: 'dark',
      textSize: 125
    })
    /* likes and allergens it does not show are kept */
    expect(JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}')).toEqual({
      likes: ['beef'],
      dislikes: [],
      allergens: ['gluten (oats)', 'milk'],
      diet: 'vegetarian'
    })

    /* the next change clears the confirmation, so the next save is announced afresh */
    await user.click(screen.getByRole('radio', { name: 'Match my device' }))
    expect(status()).toBeEmptyDOMElement()
    await user.clear(textSize())
    await user.type(textSize(), '100')
    await user.click(save())
    expect(root.hasAttribute('data-theme')).toBe(false)
    expect(root.style.fontSize).toBe('')
  })

  it('works by keyboard alone: arrows choose, Space ticks, Enter submits', async () => {
    const { user } = setup()
    screen.getByRole('radio', { name: 'Match my device' }).focus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked()
    await user.tab()
    expect(textSize()).toHaveFocus()
    await user.keyboard('{Control>}a{/Control}140')
    await user.tab()
    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(screen.getByRole('radio', { name: 'Vegetarian' })).toBeChecked()
    await user.tab()
    expect(screen.getByRole('checkbox', { name: 'Crustacean' })).toHaveFocus()
    await user.keyboard(' ')
    expect(screen.getByRole('checkbox', { name: 'Crustacean' })).toBeChecked()
    textSize().focus()
    await user.keyboard('{Enter}')
    expect(status()).toHaveTextContent('Preferences saved.')
    expect(root.dataset['theme']).toBe('light')
    expect(root.style.fontSize).toBe('22.4px')
  })
})

describe('Preferences form: accessibility', () => {
  it('has no axe violations, with or without errors', async () => {
    const { user, view } = setup()
    expect(await axe(view.container)).toHaveNoViolations()
    await user.clear(textSize())
    await user.click(save())
    expect(await axe(view.container)).toHaveNoViolations()
  })

  it('keeps every control at least 44px tall', () => {
    setup()
    const labels = [
      ...within(form()).getAllByRole('radio'),
      ...within(form()).getAllByRole('checkbox')
    ].map((input) => input.closest('label'))
    labels.forEach((label) =>
      expect(label?.className).toMatch(/min-h-\[44px\]/)
    )
    expect(textSize().className).toMatch(/min-h-\[44px\]/)
  })
})
