import '@testing-library/jest-dom'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { DemoPage } from '../DemoPage'

expect.extend(toHaveNoViolations)

const pick = async (name: string) =>
  userEvent.click(screen.getByRole('button', { name: `Add ${name}` }))

describe('DemoPage', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<DemoPage />)
    await pick('carrot')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('lists every ingredient, with no suggestion and a disabled bottom-right button', () => {
    render(<DemoPage />)
    expect(screen.getAllByRole('listitem')).toHaveLength(8)
    expect(screen.queryByText('Suggestions')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add ticket' })).toBeDisabled()
  })

  it('filters by search and says when nothing matches', async () => {
    render(<DemoPage />)
    await userEvent.type(screen.getByLabelText('Find an ingredient'), 'rice')
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    await userEvent.type(screen.getByLabelText('Find an ingredient'), 'zz')
    expect(screen.getByText('No ingredient matches.')).toBeInTheDocument()
  })

  it('picks an ingredient, acknowledges it and suggests what is missing, with the cost', async () => {
    render(<DemoPage />)
    await pick('carrot')
    await pick('flour')
    expect(screen.getByRole('status')).toHaveTextContent('flour picked')
    const card = screen.getByText('Carrot cake').closest('li')
    expect(card).toHaveTextContent('Add sugar · $2 to buy')
  })

  it('removes a picked ingredient again', async () => {
    render(<DemoPage />)
    await pick('carrot')
    await userEvent.click(screen.getByRole('button', { name: 'Remove carrot' }))
    expect(screen.getByRole('status')).toHaveTextContent('carrot removed')
    expect(screen.queryByText('Suggestions')).not.toBeInTheDocument()
  })

  it('adds a ticket from the suggestion card and then disables it', async () => {
    render(<DemoPage />)
    await pick('carrot')
    const card = screen.getByText('Carrot cake').closest('li')
    if (card === null) throw new Error('no card')
    const add = within(card).getByRole('button', { name: 'Add ticket' })
    await userEvent.click(add)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Carrot cake is on your tickets'
    )
    expect(add).toBeDisabled()
    const tickets = screen.getByRole('region', { name: 'Tickets' })
    expect(within(tickets).getByText('Carrot cake')).toBeInTheDocument()
  })

  it('adds a ticket from the bottom-right button, one suggestion at a time', async () => {
    render(<DemoPage />)
    await pick('carrot')
    await pick('rice')
    await userEvent.click(
      screen.getByRole('button', { name: 'Add ticket for Carrot cake' })
    )
    const tickets = screen.getByRole('region', { name: 'Tickets' })
    expect(within(tickets).getAllByRole('listitem')).toHaveLength(1)
    expect(
      screen.getByRole('button', { name: 'Add ticket for Chicken and rice' })
    ).toBeEnabled()
  })

  it('says when a suggestion needs nothing more', async () => {
    render(<DemoPage />)
    await pick('carrot')
    await pick('flour')
    await pick('sugar')
    expect(screen.getByText(/You have everything/)).toBeInTheDocument()
  })
})
