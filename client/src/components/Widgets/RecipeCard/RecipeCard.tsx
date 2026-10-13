import React, { FC, CSSProperties } from 'react'
import type { ClientRecipe } from 'types/client'
import { IngreIconPro } from 'lib/icon/Icon'
import { useAuthContext } from 'utils/auth/AuthContext'
import { useRecipeCard } from './useRecipeCard'
import { EditButton } from './components/EditButton'
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
  const {
    getRecipeError,
    getRecipeLoading,
    handleEdit,
    handleSave,
    savedRecipes,
    saveRecipeLoading
  } = useRecipeCard({ recipe, onSavedPage })
  return getRecipeError ? (
    'Error'
  ) : getRecipeLoading ? (
    'Loading'
  ) : (
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
        <EditButton
          key="edit"
          handleEdit={handleEdit}
          loggedIn={loggedIn}
        />
      </td>
      <td>
        <SaveButton
          key="save"
          handleSave={handleSave}
          savedRecipes={savedRecipes}
          saveRecipeLoading={saveRecipeLoading}
          edamamId={recipe.edamamId}
          loggedIn={loggedIn}
        />
      </td>
    </tr>
  )
}

export default RecipeCard
