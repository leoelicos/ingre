import '@testing-library/jest-dom'
import { fireEvent } from '@testing-library/react'
import { chipOrder, pick, renderList, toggleOf } from '../../../test/renderList'
import { readFirstEndToEnd } from '../../../utils/tier/upsell'

describe('first end-to-end (#208)', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.pushState({}, '', '/')
  })

  const crossOffEverything = () => {
    for (const id of chipOrder()) {
      if (id !== null) fireEvent.click(toggleOf(id))
    }
  }

  it('is remembered once a picked recipe has every chip crossed off, with the tiers flag on', () => {
    window.history.pushState({}, '', '/?flags=tiers')
    pick('dahl')
    renderList()
    expect(readFirstEndToEnd()).toBe(false)
    crossOffEverything()
    expect(readFirstEndToEnd()).toBe(true)
  })

  it('is not tracked with the flag off', () => {
    pick('dahl')
    renderList()
    crossOffEverything()
    expect(readFirstEndToEnd()).toBe(false)
  })
})
