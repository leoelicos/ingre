import React, { FC } from 'react'
import RecipeCardContainer from 'components/Widgets/RecipeCard/RecipeCardContainer'
import { useHome } from './useHome'

const HomeComponent: FC<{
  loggedIn: boolean
  firstName: string
  loadingEdamam: boolean
  edamamRecipes: Array<any>
  handleRefresh: any
}> = ({ loggedIn, firstName, loadingEdamam, edamamRecipes, handleRefresh }) => {
  return (
    <div className="container">
      {loggedIn && <p>Welcome {firstName}</p>}
      {loadingEdamam ? (
        <p>Loading…</p>
      ) : (
        <RecipeCardContainer
          results={edamamRecipes}
          loading={loadingEdamam}
          onSavedPage={false}
        />
      )}
    </div>
  )
}

const Home: FC = () => {
  const { loggedIn, firstName, loadingEdamam, edamamRecipes, handleRefresh } =
    useHome()
  return (
    <HomeComponent
      loggedIn={loggedIn}
      firstName={firstName}
      loadingEdamam={loadingEdamam}
      edamamRecipes={edamamRecipes}
      handleRefresh={handleRefresh}
    />
  )
}

export default Home
