import React, { FC } from 'react'
import { Card, Dropdown } from 'react-bootstrap'
import type { ClientRecipe } from 'types/client'
import { IngreIconChevronDown, IngreIconPro } from 'lib/icon/Icon'
import { useAuthContext } from 'utils/auth/AuthContext'
import { EditButton, SaveButton } from './RecipeCardButtons'
import { useRecipeCard } from './useRecipeCard'

interface RecipeCardProps {
  recipe: ClientRecipe
  onSavedPage: boolean
  pro: boolean
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
  return (
    <Card>
      <Card.Text>
        <Card.Img src={'temp.svg'} />
      </Card.Text>
      <Card.Body className="d-flex justify-content-between">
        <div className="me-3">{recipe.name}</div>
        <Dropdown>
          <Dropdown.Toggle
            variant="success"
            id="dropdown-basic"
          >
            <IngreIconChevronDown />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {loggedIn && pro && (
              <Dropdown.Item
                href={recipe.instructions}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IngreIconPro /> Instructions
              </Dropdown.Item>
            )}
            <Dropdown.Item>
              <EditButton
                key="edit"
                getRecipeError={getRecipeError}
                getRecipeLoading={getRecipeLoading}
                handleEdit={handleEdit}
                loggedIn={loggedIn}
              />
            </Dropdown.Item>
            <Dropdown.Item>
              <SaveButton
                key="save"
                handleSave={handleSave}
                savedRecipes={savedRecipes}
                saveRecipeLoading={saveRecipeLoading}
                edamamId={recipe.edamamId}
                loggedIn={loggedIn}
              />
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Card.Body>
    </Card>
  )
}

export default RecipeCard
