import RecipeCard from './RecipeCard.jsx'
import { BackTop, Divider, Empty, Spin } from 'antd'
import { useQuery } from '@apollo/client'
import { GET_USER } from '../../utils/apollo/queries.ts'
import Auth from '../../utils/auth/auth.ts'
import { useMemo } from 'react'

const RecipeCardContainer = ({ results, loading, onSavedPage }) => {
  const { data } = useQuery(GET_USER)

  const memoizedResults = useMemo(
    () =>
      results?.map((recipe, idx) => {
        return (
          <RecipeCard
            key={idx}
            recipe={recipe}
            onSavedPage={onSavedPage}
            pro={Auth.loggedIn() ? data?.getUser?.pro || false : false}
          />
        )
      }),
    [results, data, onSavedPage]
  )

  if (loading) {
    return <RecipeCardContainerLoading />
  } else if (!results || !results.length) {
    return <RecipeCardContainerEmpty />
  } else {
    return (
      <div style={recipeCardContainerStyle}>
        {memoizedResults}
        <BackTop />
      </div>
    )
  }
}

export default RecipeCardContainer

const recipeCardContainerStyle = {
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'center',
  marginTop: '1rem',
  rowGap: '1rem',
  columnGap: '1rem'
}

const RecipeCardContainerLoading = () => (
  <Divider>
    <Spin tip="Loading saved recipes…" />
  </Divider>
)
const RecipeCardContainerEmpty = () => (
  <div style={recipeCardContainerStyle}>
    <Empty>No recipes</Empty>
    <BackTop />
  </div>
)
