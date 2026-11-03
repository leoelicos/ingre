import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Landing } from '../Landing'

expect.extend(toHaveNoViolations)

beforeEach(() => {
  HTMLElement.prototype.scrollTo = jest.fn()
})

describe('Landing (#211, #238)', () => {
  it('has the headline, three cards and one button', () => {
    render(<Landing onStart={jest.fn()} />)
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /organised ingredient lists in 2 minutes/
      })
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('group', { name: /^Card \d of 3$/ })
    ).toHaveLength(3)
    expect(
      screen.getByRole('heading', { level: 2, name: 'The problem' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Start from the ingredient'
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Three questions, then Explore'
      })
    ).toBeInTheDocument()
  })

  it('pictures the loop as ingredient, suggestion, ticket, with the arrows hidden from readers', () => {
    render(<Landing onStart={jest.fn()} />)
    const steps = screen.getAllByRole('listitem')
    expect(steps.map((li) => li.textContent)).toEqual([
      'Ingredient',
      '→Suggestion',
      '→Ticket'
    ])
    expect(document.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2)
  })

  it('Get started moves on', async () => {
    const onStart = jest.fn()
    render(<Landing onStart={onStart} />)
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Get started' }))
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('has no axe violations', async () => {
    const { container } = render(<Landing onStart={jest.fn()} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
