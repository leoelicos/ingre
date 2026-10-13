import type { ClientRecipe } from '../../types/client'
import type { FC } from 'react'
import RecipeCardContainer from '../../components/Widgets/RecipeCard/RecipeCardContainer'
import { useHome } from './useHome'

const HomeComponent: FC<{
  loggedIn: boolean
  firstName: string
  loadingRecipes: boolean
  libraryRecipes: ClientRecipe[]
  handleRefresh: (query: string) => Promise<void>
}> = ({ loggedIn, firstName, loadingRecipes, libraryRecipes }) => {
  return (
    <div className="container">
      {loggedIn && <p>Welcome {firstName}</p>}
      {loadingRecipes ? (
        <p>Loading…</p>
      ) : (
        <RecipeCardContainer
          results={libraryRecipes}
          loading={loadingRecipes}
          onSavedPage={false}
        />
      )}
    </div>
  )
}

const Home: FC = () => {
  const { loggedIn, firstName, loadingRecipes, libraryRecipes, handleRefresh } =
    useHome()
  return (
    <HomeComponent
      loggedIn={loggedIn}
      firstName={firstName}
      loadingRecipes={loadingRecipes}
      libraryRecipes={libraryRecipes}
      handleRefresh={handleRefresh}
    />
  )
}

export default Home
