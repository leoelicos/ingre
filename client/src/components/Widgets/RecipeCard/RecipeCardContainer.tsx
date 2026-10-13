import React, { FC, CSSProperties } from 'react'
import { useAuthContext } from 'utils/auth/AuthContext'
import RecipeCard from './RecipeCard'

type RecipeCardContainerType = FC<{
  results: any[]
  loading: boolean
  onSavedPage: boolean
}>

const RecipeCardContainerStyle: CSSProperties = {
  width: '100%'
}
const RecipeCardContainer: RecipeCardContainerType = ({
  results,
  loading,
  onSavedPage
}) => {
  const [auth] = useAuthContext()
  const pro = auth.profile?.data.pro || false
  return (
    <table style={RecipeCardContainerStyle}>
      {loading ? (
        <tr>
          <td>Loading saved recipes…</td>
        </tr>
      ) : !results || results.length === 0 ? (
        <tr>
          <td>No recipes</td>
        </tr>
      ) : (
        results?.map((recipe, idx) => {
          return (
            <RecipeCard
              key={idx}
              recipe={recipe}
              onSavedPage={onSavedPage}
              pro={pro}
            />
          )
        })
      )}
    </table>
  )
}

export default RecipeCardContainer
