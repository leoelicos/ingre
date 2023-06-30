/* react */
import React, { FC } from 'react'

/* components */
import { BackTop } from 'antd'
import RecipeCardContainerLoading from './RecipeCardContainerLoading.tsx'
import RecipeCardContainerEmpty from './RecipeCardContainerEmpty.tsx'
import RecipeCards from './RecipeCards.tsx'

/* state */
import { useAuthContext } from '../../utils/auth/AuthContext.tsx'

interface RecipeCardContainerProps {
  results: any[]
  loading: boolean
  onSavedPage: boolean
}

const recipeCardContainerStyle = {
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'center',
  marginTop: '1rem',
  rowGap: '1rem',
  columnGap: '1rem'
}

const RecipeCardContainer: FC<RecipeCardContainerProps> = ({
  results,
  loading,
  onSavedPage
}) => {
  const [authState] = useAuthContext()
  const pro = authState.profile?.data.pro || false

  return (
    <div style={recipeCardContainerStyle}>
      {loading ? (
        <RecipeCardContainerLoading />
      ) : !results ? (
        <RecipeCardContainerEmpty />
      ) : !results.length ? (
        <RecipeCardContainerEmpty />
      ) : (
        <RecipeCards
          results={results}
          pro={pro}
          onSavedPage={onSavedPage}
        />
      )}
      <BackTop />
      {/*   BackTop doesn't work */}
    </div>
  )
}

export default RecipeCardContainer
