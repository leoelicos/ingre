import '@testing-library/jest-dom'
import { fireEvent, screen, within } from '@testing-library/react'
import { renderList, searchBox } from '../../../test/renderList'

describe('Scenario: the add button in the bottom-right area (#210)', () => {
  beforeEach(() => localStorage.clear())

  it('sits in the Quick actions group on the list page', () => {
    renderList()
    const group = screen.getByRole('group', { name: 'Quick actions' })
    expect(
      within(group).getByRole('button', { name: 'Add item' })
    ).toBeInTheDocument()
  })

  it('opens Explore and puts the cursor in search', () => {
    renderList()
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }))
    expect(searchBox()).toHaveFocus()
    expect(screen.getByRole('button', { name: /^Explore/ })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
  })

  it('is not on other pages', () => {
    renderList('/elsewhere')
    expect(screen.queryByRole('group', { name: 'Quick actions' })).toBeNull()
  })
})
