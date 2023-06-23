/* react */
import React, { FC, useMemo } from 'react'

/* components */
import RecipeCard from './RecipeCard.jsx'
import { BackTop } from 'antd'
import RecipeCardContainerLoading from './RecipeCardContainerLoading.tsx'

/* data */
import { useQuery } from '@apollo/client'
import { GET_USER } from '../../utils/apollo/queries.ts'

/* auth */
import Auth from '../../utils/auth/auth.ts'
import RecipeCardContainerEmpty from './RecipeCardContainerEmpty.tsx'
import RecipeCards from './RecipeCards.tsx'

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

interface GetUser {
  getUser: {
    firstName: string
    pro: string
  }
}

const RecipeCardContainer: FC<RecipeCardContainerProps> = ({
  results,
  loading,
  onSavedPage
}) => {
  const { data } = useQuery<GetUser>(GET_USER)

  const pro = useMemo(() => {
    if (!data) return false
    if (!data.getUser) return false
    if (!data.getUser.pro) return false
    if (!Auth.loggedIn) return false
    return true
  }, [data, Auth.loggedIn])

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
      {/* BackTop doesn't work */}
    </div>
  )
}

export default RecipeCardContainer
