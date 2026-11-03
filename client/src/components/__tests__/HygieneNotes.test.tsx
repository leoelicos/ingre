import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import type { Chip } from '../../utils/chips/chips'
import { catalogue } from '../../utils/library/recipeLibrary'
import { HygieneNotes } from '../HygieneNotes'

expect.extend(toHaveNoViolations)

const chipOf = (id: string): Chip => {
  const [item = null] = catalogue.filter((i) => i.id === id)
  return {
    id,
    name: id,
    item,
    unit: 'g',
    sources: [],
    total: { amount: 0, unit: 'g' },
    extra: null,
    section: 'Other',
    group: 'Other',
    crossed: false,
    greyed: false,
    customised: false
  }
}

describe('HygieneNotes', () => {
  it('shows nothing for a dry shop', () => {
    const { container } = render(<HygieneNotes chips={[chipOf('rice')]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the core notes for raw chicken, with no way to dismiss them', async () => {
    const { container } = render(
      <HygieneNotes chips={[chipOf('chicken-thigh')]} />
    )
    const region = screen.getByRole('region', { name: 'Food safety' })
    expect(region).toHaveTextContent('Keep raw meat and eggs apart')
    expect(region).toHaveTextContent('Wash and dry your hands')
    expect(region).toHaveTextContent('5 °C or below')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('asks for a fridge check on a big chilled shop', () => {
    const chilled = catalogue
      .filter((i) => i.pantry === 'Fridge')
      .slice(0, 12)
      .map((i) => chipOf(i.id))
    render(<HygieneNotes chips={chilled} />)
    expect(screen.getByText(/Check the fridge has room/)).toBeInTheDocument()
  })
})
