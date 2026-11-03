import '@testing-library/jest-dom'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { resetViewport, setViewportWidth } from '../../../test/media'
import { catalogue } from '../../../utils/library/recipeLibrary'
import { COOK_SETTINGS_KEY } from '../../../utils/cook/cookSettings'
import { pick, region, renderList } from '../../../test/renderList'
import { CarePlan, labelText, weighText } from '../CookPlan'

expect.extend(toHaveNoViolations)

/* #221 Precise execution: the Cook plan section on the list page. */

beforeEach(() => localStorage.clear())
afterEach(resetViewport)

const plan = () => within(region('Cook plan'))
const block = (name: string) =>
  within(
    plan().getByRole('heading', { level: 3, name }).parentElement ??
      document.body
  )
const setDay = (value: string) =>
  fireEvent.change(plan().getByLabelText('Day you cook'), {
    target: { value }
  })
const stored = () =>
  JSON.parse(localStorage.getItem(COOK_SETTINGS_KEY) ?? 'null')

describe('Cook plan section (#221)', () => {
  it('is not on the page until a recipe is picked', () => {
    renderList()
    expect(screen.queryByRole('region', { name: 'Cook plan' })).toBeNull()
  })

  it('has the six blocks in order', () => {
    pick('shaking-beef')
    renderList()
    expect(
      plan()
        .getAllByRole('heading', { level: 3 })
        .map((h) => h.textContent)
    ).toEqual([
      'Prepare ahead',
      'Timed steps',
      'Weigh out',
      'Where to find',
      'Keeping diets apart',
      'Container labels'
    ])
  })

  describe('prepare ahead', () => {
    it('counts days before until a day is set, then gives the dates', () => {
      pick('dahl')
      renderList()
      expect(
        block('Prepare ahead').getByText('1 day before')
      ).toBeInTheDocument()
      expect(
        block('Prepare ahead').getByText(/^Red lentil dahl: Simmer the lentils/)
      ).toBeInTheDocument()
      setDay('2026-11-07')
      expect(block('Prepare ahead').getByText('Fri, 6 Nov')).toBeInTheDocument()
    })

    it('says so when nothing needs it', () => {
      pick('greek-salad-haloumi')
      renderList()
      expect(
        block('Prepare ahead').getByText(
          'Nothing on your list needs preparing ahead.'
        )
      ).toBeInTheDocument()
    })
  })

  describe('timed steps', () => {
    it('lists each timed step under its recipe, with its times first', () => {
      pick('shaking-beef')
      renderList()
      const timed = block('Timed steps')
      expect(timed.getByText('Shaking beef (bò lúc lắc)')).toBeInTheDocument()
      expect(timed.getByText('2 to 3 minutes')).toBeInTheDocument()
      expect(timed.getByText('30 seconds')).toBeInTheDocument()
      expect(
        timed.getByText(/^Step 4: Heat oil in a wok until smoking/)
      ).toBeInTheDocument()
    })

    it('says so when no step is timed', () => {
      pick('greek-salad-haloumi')
      renderList()
      expect(
        block('Timed steps').getByText('None of your recipes has a timed step.')
      ).toBeInTheDocument()
    })
  })

  describe('weigh out', () => {
    it('gives exact grams as the recipe has them and estimates the rest', () => {
      pick('shaking-beef')
      renderList()
      const weigh = block('Weigh out')
      expect(weigh.getByText('2 serves')).toBeInTheDocument()
      expect(weigh.getByText('Beef rump steak: 350 g')).toBeInTheDocument()
      expect(weigh.getByText(/^Red onion: about 75 g \(/)).toBeInTheDocument()
      expect(
        weigh.getByText(/^Oyster sauce: about 20 ml \(/)
      ).toBeInTheDocument()
    })

    it('words a line it cannot weigh in its own unit', () => {
      const salt = catalogue.find((i) => i.id === 'salt') ?? null
      expect(
        weighText({
          line: {
            ingredientId: 'salt',
            name: 'salt',
            item: salt,
            quantity: 1,
            measure: 'pinch',
            original: null
          },
          amount: null,
          exact: false
        })
      ).toMatch(/^Salt: 1 pinch/)
    })
  })

  describe('where to find', () => {
    it('says where to look and what to ask for', () => {
      pick('rice-paper-rolls')
      renderList()
      const source = block('Where to find')
      expect(source.getByText('Pork belly slices:')).toBeInTheDocument()
      expect(
        source.getByText(/^Butcher: a boneless, skinless slab/)
      ).toBeInTheDocument()
      expect(source.getByText('Rice paper sheets:')).toBeInTheDocument()
    })

    it('says so when everything is a usual item', () => {
      pick('greek-salad-haloumi')
      renderList()
      expect(
        block('Where to find').getByText(
          'Everything on your list is a usual supermarket item.'
        )
      ).toBeInTheDocument()
    })
  })

  describe('keeping diets apart', () => {
    it('offers the allergens on the list and asks which to avoid', () => {
      pick('dahl', 'beef-keema')
      renderList()
      const diet = block('Keeping diets apart')
      expect(diet.getByRole('checkbox', { name: 'Milk' })).not.toBeChecked()
      expect(
        diet.getByText(/^Tick an allergen to see which dishes are safe/)
      ).toBeInTheDocument()
    })

    it('flags the dishes that contain it and says how to cook around it', () => {
      pick('dahl', 'beef-keema')
      renderList()
      const diet = block('Keeping diets apart')
      fireEvent.click(diet.getByRole('checkbox', { name: 'Milk' }))
      expect(
        diet.getByText('Red lentil dahl contains milk')
      ).toBeInTheDocument()
      expect(
        diet.getByText('Safe for them: Beef keema with peas')
      ).toBeInTheDocument()
      expect(diet.getByText('Cook in this order')).toBeInTheDocument()
      expect(
        diet.getByText('Cook Beef keema with peas first, on clean equipment.')
      ).toBeInTheDocument()
      expect(stored().avoid).toEqual(['milk'])
    })

    it('says when no dish contains it', () => {
      pick('beef-keema', 'dahl')
      localStorage.setItem(
        COOK_SETTINGS_KEY,
        JSON.stringify({ day: null, avoid: ['peanut'], kitchen: '' })
      )
      renderList()
      const diet = block('Keeping diets apart')
      expect(diet.getByRole('checkbox', { name: 'Peanut' })).toBeChecked()
      expect(
        diet.getByText('No dish on your list contains what they avoid.')
      ).toBeInTheDocument()
      expect(diet.queryByText('Cook in this order')).toBeNull()
    })

    it('says when every dish has it', () => {
      pick('dahl', 'butter-chicken')
      renderList()
      const diet = block('Keeping diets apart')
      fireEvent.click(diet.getByRole('checkbox', { name: 'Milk' }))
      expect(
        diet.getByText('Every dish on your list has something they avoid.')
      ).toBeInTheDocument()
      expect(diet.queryByText('Cook in this order')).toBeNull()
    })

    it('says when no recipe has a listed allergen', () => {
      pick('beef-keema')
      renderList()
      expect(
        block('Keeping diets apart').getByText(
          'No recipe on your list has a listed allergen.'
        )
      ).toBeInTheDocument()
    })
  })

  describe('container labels', () => {
    it('gives a label for the dish and one for the pasta, with how long each keeps', () => {
      pick('spaghetti-bolognese')
      renderList()
      const labels = block('Container labels')
      expect(
        labels.getByText('Spaghetti bolognese. Keeps 3 days in the fridge')
      ).toBeInTheDocument()
      expect(
        labels.getByText(
          'Spaghetti from Spaghetti bolognese. Keeps 2 days in the fridge'
        )
      ).toBeInTheDocument()
      expect(labels.getByText(/NSW Food Authority/)).toBeInTheDocument()
    })

    it('puts dates on the labels once the day is set', () => {
      pick('spaghetti-bolognese')
      renderList()
      setDay('2026-11-07')
      expect(
        block('Container labels').getByText(
          'Spaghetti from Spaghetti bolognese. Cooked Sat, 7 Nov. Eat by Mon, 9 Nov (2 days)'
        )
      ).toBeInTheDocument()
    })

    it('words a one-day label', () => {
      expect(
        labelText({ name: 'Salad', component: null, days: 1 }, '2026-11-07')
      ).toBe('Salad. Cooked Sat, 7 Nov. Eat by Sun, 8 Nov (1 day)')
      expect(labelText({ name: 'Salad', component: null, days: 1 }, null)).toBe(
        'Salad. Keeps 1 day in the fridge'
      )
    })
  })

  describe('settings', () => {
    it('keeps the day and the kitchen booking, and shows the day in the header', () => {
      pick('dahl')
      const { unmount } = renderList()
      setDay('2026-11-07')
      fireEvent.change(plan().getByLabelText('Kitchen booking'), {
        target: { value: 'Shared kitchen, Saturday 9 am' }
      })
      expect(stored()).toEqual({
        day: '2026-11-07',
        avoid: [],
        kitchen: 'Shared kitchen, Saturday 9 am'
      })
      expect(plan().getByText('Sat, 7 Nov')).toBeInTheDocument()
      unmount()
      renderList()
      expect(plan().getByLabelText('Day you cook')).toHaveValue('2026-11-07')
      expect(plan().getByLabelText('Kitchen booking')).toHaveValue(
        'Shared kitchen, Saturday 9 am'
      )
    })

    it('describes each field by its hint, for a screen reader', () => {
      pick('dahl')
      renderList()
      expect(plan().getByLabelText('Day you cook')).toHaveAccessibleDescription(
        'Set the day to put dates on prep and labels.'
      )
      expect(
        plan().getByLabelText('Kitchen booking')
      ).toHaveAccessibleDescription(/^Where and when/)
    })

    it('forgets the day when it is cleared', () => {
      pick('dahl')
      renderList()
      setDay('2026-11-07')
      setDay('')
      expect(stored().day).toBeNull()
    })
  })

  it('collapses to its header on a phone, like the other sections', () => {
    setViewportWidth(390)
    pick('dahl')
    renderList()
    const header = screen.getByRole('button', { name: /^Cook plan/ })
    expect(header).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(header)
    expect(header).toHaveAttribute('aria-expanded', 'false')
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Prepare ahead' })
    ).toBeNull()
  })

  it('has no accessibility violations, with a day and an allergen set', async () => {
    pick('dahl', 'beef-keema')
    localStorage.setItem(
      COOK_SETTINGS_KEY,
      JSON.stringify({ day: '2026-11-07', avoid: ['milk'], kitchen: 'x' })
    )
    const { container } = renderList()
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('CarePlan', () => {
  it('numbers four steps: safe dishes first, a wash, the others on separate tools, safe dishes stored above', () => {
    render(
      <CarePlan
        safe={['Beef keema with peas', 'Dahl']}
        unsafe={['Butter chicken']}
      />
    )
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(
      [
        'Cook Beef keema with peas, Dahl first, on clean equipment.',
        'Wash chopping boards, knives, pans, the bench and your hands in hot soapy water.',
        'Cook Butter chicken with separate spoons, tongs and serving spoons. Never share oil, cooking water or serving spoons.',
        'Keep the safe dishes covered, above the others in the fridge.'
      ]
    )
  })
})
