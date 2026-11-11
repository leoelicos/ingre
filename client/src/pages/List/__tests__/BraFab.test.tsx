import '@testing-library/jest-dom'
import { fireEvent, screen, within } from '@testing-library/react'
import { fab, renderList, searchBox, sheet } from '../../../test/renderList'

describe('Scenario: the FAB in the bottom-right area (#192, #210)', () => {
  beforeEach(() => localStorage.clear())

  it('sits in the Quick actions group on the list page', () => {
    renderList()
    const group = screen.getByRole('group', { name: 'Quick actions' })
    expect(within(group).getByRole('button', { name: 'Add a recipe' })).toBe(
      fab()
    )
  })

  it('+ Recipe opens Explore and puts the cursor in search', () => {
    renderList()
    fireEvent.click(fab())
    expect(sheet('Explore')).toBeInTheDocument()
    expect(searchBox()).toHaveFocus()
  })

  it('is not on other pages', () => {
    renderList('/elsewhere')
    expect(screen.queryByRole('group', { name: 'Quick actions' })).toBeNull()
  })
})
