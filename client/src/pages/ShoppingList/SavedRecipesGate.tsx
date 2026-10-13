import type { FC, ReactNode } from 'react'
import { useEffect } from 'react'
import NotLoggedIn from '../../components/NotLoggedIn'
import type { LibraryRecipe } from '../../types/library'
import { useAuthContext } from '../../utils/auth/AuthContext'
import { changeTitle } from '../../utils/changeTitle'
import { useSavedLibraryRecipes } from '../../utils/shopping/useSavedLibraryRecipes'
import '../../styles/segmented.css'
import './shoppingList.css'

/** Loads saved recipes, then renders `children(recipes)` (shared by the list and Tap Off). */
export const SavedRecipesGate: FC<{
  title: string
  children: (recipes: LibraryRecipe[]) => ReactNode
}> = ({ title, children }) => {
  useEffect(() => changeTitle(title), [title])
  const [auth] = useAuthContext()
  return (
    <main className="list-page">
      <h1 className="list-title">{title}</h1>
      {auth.loggedIn ? <LoggedIn>{children}</LoggedIn> : <NotLoggedIn />}
    </main>
  )
}

const LoggedIn: FC<{ children: (recipes: LibraryRecipe[]) => ReactNode }> = ({
  children
}) => {
  const { loading, error, recipes } = useSavedLibraryRecipes()
  if (loading) return <p>Loading your saved recipes…</p>
  if (error !== undefined) return <p>Couldn't load your saved recipes.</p>
  return <>{children(recipes)}</>
}
