import { BackTop, Divider, Empty, Spin } from 'antd'
import React, { CSSProperties, FC } from 'react'
import { useAuthContext } from '../../utils/auth/AuthContext.tsx'
import RecipeCard from './RecipeCard/RecipeCard.tsx'

type RecipeCardContainerType = FC<{
  results: any[]
  loading: boolean
  onSavedPage: boolean
}>

const RecipeCardContainer: RecipeCardContainerType = ({
  results,
  loading,
  onSavedPage
}) => {
  const [auth] = useAuthContext()
  const pro = auth.profile?.data.pro || false

  const recipeCardContainerStyle: CSSProperties = {
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'center',
    marginTop: '1rem',
    rowGap: '1rem',
    columnGap: '1rem'
  }
  return (
    <div style={recipeCardContainerStyle}>
      {loading ? (
        <Divider>
          <Spin tip="Loading saved recipes…" />
        </Divider>
      ) : !results || results.length === 0 ? (
        <Empty>No recipes</Empty>
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
      <BackTop />
      {/*   BackTop doesn't work */}
    </div>
  )
}

export default RecipeCardContainer
