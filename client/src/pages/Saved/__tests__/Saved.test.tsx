import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Saved } from '../Saved'
import { FAVOURITES_KEY } from '../../../utils/storage/favourites'
import { AuthProvider } from '../../../utils/auth/AuthContext'

const renderSaved = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <Saved />
      </AuthProvider>
    </MemoryRouter>
  )

describe('Saved', () => {
  beforeEach(() => localStorage.clear())

  it('explains the heart when nothing is saved', () => {
    renderSaved()
    expect(screen.getByText(/Tap the heart/)).toBeInTheDocument()
  })

  it('lists hearted library recipes without logging in', () => {
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(['dahl']))
    renderSaved()
    expect(
      screen.getByRole('heading', { name: 'Red lentil dahl' })
    ).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1)
  })
})
