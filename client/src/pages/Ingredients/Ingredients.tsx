import React, { FC } from 'react'
import { Link } from 'react-router-dom'
import NotLoggedIn from 'components/NotLoggedIn'
import {
  IngreIconAddIngredient,
  IngreIconClearCustom,
  IngreIconSave
} from 'lib/icon/Icon'
import { useAuthContext } from 'utils/auth/AuthContext'
import { useIngredients } from './useIngredients.ts'

export const Ingredients: FC = () => {
  const {
    savedRecipeLoading,
    savedRecipeError,
    dataSource,
    reload,
    onFinish,
    handleAdd
  } = useIngredients()
  const [auth] = useAuthContext()
  if (!auth.loggedIn)
    return (
      <>
        <p>Ingredients</p>
        <NotLoggedIn />
      </>
    )

  return (
    <div>
      <p>Ingredients</p>
      <div>
        <button onClick={reload}>
          <IngreIconClearCustom /> Generate
        </button>

        {savedRecipeLoading ? (
          <div>Loading saved ingredients</div>
        ) : savedRecipeError ? (
          <p>Couldn't load saved ingredients</p>
        ) : (
          <form onSubmit={onFinish}>
            {dataSource.length ? (
              <table>
                <tbody>
                  {dataSource.map((row) => (
                    <tr>{JSON.stringify(row)}</tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Click the Generate button to make a new list</p>
            )}
            <div>
              <button onClick={handleAdd}>
                <IngreIconAddIngredient /> Ingredient
              </button>
            </div>
            <div>
              <Link to="/tapoff">
                <button type="submit">
                  <IngreIconSave /> Tap Off
                </button>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
