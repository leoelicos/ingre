import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ClientRecipe } from '../../../../types/client'

const HeartIcon: FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinejoin="round"
  >
    <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.6 3.9 4 7.4 4c2 0 3.6 1.1 4.6 2.7C13 5.1 14.6 4 16.6 4c3.5 0 5.8 3.6 4.6 7.1-1.7 4.8-9.2 9.4-9.2 9.4z" />
  </svg>
)

export const SaveButton: FC<{
  recipeName: string
  handleSave: () => void
  savedRecipes: ClientRecipe[]
  saveRecipeLoading: boolean
  libraryId: string
  loggedIn: boolean
}> = ({
  recipeName,
  handleSave,
  savedRecipes,
  saveRecipeLoading,
  libraryId,
  loggedIn
}) => {
  const navigate = useNavigate()
  const saved = savedRecipes.some((r) => r.libraryId === libraryId)
  return (
    <button
      type="button"
      className="icon-button"
      aria-label={saved ? `Saved ${recipeName}` : `Save ${recipeName}`}
      aria-pressed={saved}
      aria-busy={saveRecipeLoading}
      disabled={saved || saveRecipeLoading}
      onClick={loggedIn ? handleSave : () => navigate('/login')}
    >
      <HeartIcon filled={saved} />
    </button>
  )
}
