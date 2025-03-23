import React, { FC, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import NotLoggedIn from 'components/NotLoggedIn'
import { useAuthContext } from 'utils/auth/AuthContext'
import { changeTitle } from 'utils/changeTitle'
import type { compressedCategoriesType } from 'utils/compress'
import compress from 'utils/compress'
import { useStoreContext } from 'utils/state/GlobalState'
import { UPDATE_TAP_OFF } from 'utils/state/actions'
import './style.css'

const TapOff: FC = () => {
  changeTitle('tapoff')

  const [auth] = useAuthContext()
  const loggedIn = auth.loggedIn

  const [state, dispatch] = useStoreContext()
  const { savedIngredients } = state
  const [compressedRecipes, setCompressedRecipes] =
    useState<compressedCategoriesType>(() => {
      const initialState = [
        {
          items: [
            {
              description: 'Loading',
              checked: false
            }
          ],
          category: { name: 'Loading' }
        }
      ]
      return initialState
    })

  const handleChange = (ri: number, ii: number, checked: boolean) => {
    const x = JSON.parse(JSON.stringify(compressedRecipes))
    x[ri].items[ii].checked = checked
    setCompressedRecipes(x)
  }

  useEffect(() => {
    const compressed = compress(savedIngredients)
    setCompressedRecipes(compressed)
    dispatch({ type: UPDATE_TAP_OFF, data: compressed })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <p>Tap Off</p>
      {!loggedIn ? (
        <NotLoggedIn />
      ) : (
        <>
          {compressedRecipes?.length ? (
            compressedRecipes.map((r, ri) => (
              <>
                <p>{r.category.name}</p>
                {r.items.map((i, ii) => (
                  <>
                    {' '}
                    <input
                      key={r.category + i.description}
                      type="checkbox"
                      checked={i.checked}
                      onChange={(e) => handleChange(ri, ii, e.target.checked)}
                    />
                    <label htmlFor={r.category + i.description}>
                      {i.description}
                    </label>
                  </>
                ))}
              </>
            ))
          ) : (
            <>
              Generate an ingredient list first
              <Link to="/ingredients">Ingredients</Link>
            </>
          )}
        </>
      )}
    </div>
  )
}
export default TapOff
