import type { CSSProperties } from 'react'
import type { FC } from 'react'
import type { ClientRecipe } from '../../../types/client'
import { IngreIconPro } from '../../../lib/icon/Icon'
import { useAuthContext } from '../../../utils/auth/AuthContext'
import { useRecipeCard } from './useRecipeCard'
import { SaveButton } from './components/SaveButton'

interface RecipeCardProps {
  recipe: ClientRecipe
  onSavedPage: boolean
  pro: boolean
}

const RecipeCardStyle: CSSProperties = {
  // display: 'flex',
  // width: '100%',
  // justifyContent: 'space-between'
}
const RecipeCard: FC<RecipeCardProps> = ({ recipe, onSavedPage, pro }) => {
  const [auth] = useAuthContext()
  const loggedIn = auth.loggedIn
  const { handleSave, savedRecipes, saveRecipeLoading } = useRecipeCard({
    recipe,
    onSavedPage
  })
  return (
    <tr style={RecipeCardStyle}>
      <td>
        <h6>{recipe.name}</h6>
      </td>
      <td>
        {loggedIn && pro && (
          <a
            href={recipe.instructions}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IngreIconPro /> Instructions
          </a>
        )}
      </td>
      <td>
        <SaveButton
          key="save"
          handleSave={handleSave}
          savedRecipes={savedRecipes}
          saveRecipeLoading={saveRecipeLoading}
          libraryId={recipe.libraryId ?? ''}
          loggedIn={loggedIn}
        />
      </td>
    </tr>
  )
}

export default RecipeCard
