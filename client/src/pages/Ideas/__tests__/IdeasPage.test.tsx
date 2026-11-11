import '@testing-library/jest-dom'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IDEA_LIMIT, IdeasPage } from '../IdeasPage'

const renderIdeas = () => render(<IdeasPage />)
const field = () => screen.getByRole('searchbox', { name: 'What do you have?' })
const ideas = () =>
  within(screen.getByRole('list', { name: 'Ideas' })).getAllByRole('listitem')

describe('Ideas page (#225)', () => {
  it('starts with a hint and no ideas', () => {
    renderIdeas()
    expect(
      screen.getByRole('heading', { name: 'Ideas', level: 1 })
    ).toBeVisible()
    expect(screen.getByText('Ideas appear as you type.')).toBeVisible()
    expect(screen.queryByRole('list', { name: 'Ideas' })).toBeNull()
    expect(screen.queryByRole('status')).toBeNull()
    expect(document.title).toBe('Ideas')
  })

  it('says it calls no AI service', () => {
    renderIdeas()
    expect(screen.getByText(/no AI service is called/)).toBeVisible()
  })

  it('lists ideas with their reasons as you type', async () => {
    renderIdeas()
    await userEvent.type(field(), 'carrots and flour')
    expect(screen.getByRole('status')).toHaveTextContent(`${IDEA_LIMIT} ideas`)
    const butter = ideas().find(
      (li) => li.getAttribute('data-idea') === 'butter'
    )
    expect(butter).toHaveTextContent('butter')
    expect(butter).toHaveTextContent('Goes with carrot, plain flour.')
  })

  it('says so when nothing matches', async () => {
    renderIdeas()
    await userEvent.type(field(), 'zzzz')
    expect(screen.getByRole('status')).toHaveTextContent(
      'Nothing in the pairing list matches yet.'
    )
    expect(screen.queryByRole('list', { name: 'Ideas' })).toBeNull()
  })

  it('removes an avoided allergen from the ideas', async () => {
    renderIdeas()
    await userEvent.type(field(), 'carrots and flour')
    expect(
      ideas().some((li) => li.getAttribute('data-idea') === 'butter')
    ).toBe(true)
    await userEvent.click(screen.getByRole('checkbox', { name: 'milk' }))
    expect(
      ideas().some((li) => li.getAttribute('data-idea') === 'butter')
    ).toBe(false)
    await userEvent.click(screen.getByRole('checkbox', { name: 'milk' }))
    expect(
      ideas().some((li) => li.getAttribute('data-idea') === 'butter')
    ).toBe(true)
  })
})
