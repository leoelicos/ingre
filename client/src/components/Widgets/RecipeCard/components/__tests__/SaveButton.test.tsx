import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { ComponentProps } from 'react'
import { SaveButton } from '../SaveButton'
import { recipe } from '../../../../../test/fixtures'

const renderButton = (props: Partial<ComponentProps<typeof SaveButton>>) => {
  const handleSave = jest.fn()
  render(
    <MemoryRouter>
      <Routes>
        <Route
          path="/"
          element={
            <SaveButton
              recipeName="Pasta"
              handleSave={handleSave}
              savedRecipes={[]}
              saveRecipeLoading={false}
              libraryId="ed1"
              loggedIn={true}
              {...props}
            />
          }
        />
        <Route
          path="/login"
          element={<p>Login page</p>}
        />
      </Routes>
    </MemoryRouter>
  )
  return { handleSave }
}

describe('SaveButton', () => {
  it('is an unpressed, labelled heart that saves when logged in', () => {
    const { handleSave } = renderButton({})
    const button = screen.getByRole('button', { name: 'Save Pasta' })
    expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(button).toHaveAttribute('aria-busy', 'false')
    expect(button.querySelector('svg')).toHaveAttribute('fill', 'none')
    fireEvent.click(button)
    expect(handleSave).toHaveBeenCalled()
  })

  it('is busy and disabled while saving', () => {
    renderButton({ saveRecipeLoading: true })
    const button = screen.getByRole('button', { name: 'Save Pasta' })
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toBeDisabled()
  })

  it('is pressed, filled and disabled once saved', () => {
    renderButton({ savedRecipes: [recipe({ libraryId: 'ed1' })] })
    const button = screen.getByRole('button', { name: 'Saved Pasta' })
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(button.querySelector('svg')).toHaveAttribute('fill', 'currentColor')
    expect(button).toBeDisabled()
  })

  it('goes to login when logged out', () => {
    const { handleSave } = renderButton({ loggedIn: false })
    fireEvent.click(screen.getByRole('button', { name: 'Save Pasta' }))
    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(handleSave).not.toHaveBeenCalled()
  })
})
