import React, { FC } from 'react'
import NotLoggedIn from 'components/NotLoggedIn'
import { useAuthContext } from 'utils/auth/AuthContext'
import {
  IngreIconAddIngredient,
  IngreIconClearCustom,
  IngreIconRemove,
  IngreIconSave,
  IngreIconUndoCustom
} from 'lib/icon/Icon'
import { useCustomiseForm } from './useCustomiseForm'
import { useSaveRecipe } from 'lib/apollo/graphQL/useSaveRecipe'
import { useUpdateRecipe } from 'lib/apollo/graphQL/updateRecipe'
import './customise.css'

const Customise: FC = () => {
  const [auth] = useAuthContext()
  const { saveRecipe, saveRecipeLoading, saveRecipeError } = useSaveRecipe()
  const { updateRecipe, updateRecipeLoading, updateRecipeError } =
    useUpdateRecipe()
  const {
    handleClearAll,
    handleUndoAll,
    name,
    onNameChange,
    portions,
    onPortionsChange,
    ingredients,
    onIngredientsChange,
    onDeleteIngredient,
    onAddIngredient,
    handleBack,
    onFinish,
    saved
  } = useCustomiseForm({
    updateRecipe,
    saveRecipe
  })

  return (
    <div>
      <p>Customise</p>
      <div>
        {!auth.loggedIn ? (
          <NotLoggedIn />
        ) : (
          <form>
            <p>Recipe Name</p>
            <input
              type="text"
              placeholder="Recipe name ✏️"
              onChange={onNameChange}
              value={name}
            />
            <p>Portions</p>
            <input
              type="text"
              placeholder="Recipe Portions ✏️"
              onChange={onPortionsChange}
              value={portions}
            />
            {ingredients.map(({ name, quantity, measure, category }, idx) => (
              <div
                className="customise-ingredient-container"
                key={`ingredient${idx}`}
              >
                <div>
                  <label>Name</label>
                  <input
                    type="text"
                    id={`name-${idx}`}
                    value={name}
                    onChange={(e) =>
                      onIngredientsChange({
                        idx,
                        newObject: { name: e.target.value }
                      })
                    }
                  />
                </div>
                <div>
                  <label>Quantity</label>
                  <input
                    type="number"
                    id={`quantity-${idx}`}
                    value={quantity}
                    onChange={(e) =>
                      onIngredientsChange({
                        idx,
                        newObject: { quantity: parseFloat(e.target.value) }
                      })
                    }
                  />
                </div>
                <div>
                  <label>Measure</label>
                  <input
                    type="text"
                    id={`measure-${idx}`}
                    value={measure}
                    onChange={(e) =>
                      onIngredientsChange({
                        idx,
                        newObject: { measure: e.target.value }
                      })
                    }
                  />
                </div>
                <div>
                  <label>Category</label>
                  <input
                    type="text"
                    id={`category-${idx}`}
                    value={category}
                    onChange={(e) =>
                      onIngredientsChange({
                        idx,
                        newObject: { category: e.target.value }
                      })
                    }
                  />
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    onDeleteIngredient({ idx })
                  }}
                >
                  <IngreIconRemove /> Delete ingredient
                </button>
              </div>
            ))}

            <button
              onClick={(e) => {
                e.preventDefault()
                onAddIngredient()
              }}
            >
              <IngreIconAddIngredient /> Add ingredient
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                handleClearAll()
              }}
            >
              <IngreIconClearCustom /> Clear all
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                handleUndoAll()
              }}
            >
              <IngreIconUndoCustom /> Undo all
            </button>
            <button
              disabled={saved}
              onClick={(e) => {
                e.preventDefault()
                onFinish()
              }}
            >
              {saveRecipeLoading || updateRecipeLoading ? (
                <p>Saving…</p>
              ) : saved ? (
                <p>Saved!</p>
              ) : (
                <p>
                  <IngreIconSave /> <>Save</>
                </p>
              )}
            </button>
            {saveRecipeError || updateRecipeError ? (
              <p>
                <i>Error</i>
              </p>
            ) : null}
            <button
              disabled={saved}
              onClick={(e) => {
                e.preventDefault()
                handleBack()
              }}
            >
              Go back
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
export default Customise
