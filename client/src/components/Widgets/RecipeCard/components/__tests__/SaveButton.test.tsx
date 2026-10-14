import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { SaveButton } from '../SaveButton'
import {
  FAVOURITES_KEY,
  readFavourites
} from '../../../../../utils/storage/favourites'

describe('SaveButton', () => {
  beforeEach(() => localStorage.clear())

  it('toggles a device-only favourite without clobbering other hearts', () => {
    render(
      <>
        <SaveButton
          recipeName="Dahl"
          libraryId="dahl"
        />
        <SaveButton
          recipeName="Korma"
          libraryId="korma"
        />
      </>
    )
    const dahl = screen.getByRole('button', { name: 'Save Dahl' })
    expect(dahl).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(dahl)
    fireEvent.click(screen.getByRole('button', { name: 'Save Korma' }))
    expect([...readFavourites()].sort()).toEqual(['dahl', 'korma'])
    fireEvent.click(screen.getByRole('button', { name: 'Unsave Dahl' }))
    expect(localStorage.getItem(FAVOURITES_KEY)).toBe('["korma"]')
  })
})
