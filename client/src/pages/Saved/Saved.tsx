import React, { FC } from 'react'
import NotLoggedIn from 'components/NotLoggedIn'
import RecipeCardContainer from 'components/Widgets/RecipeCard/RecipeCardContainer'
import { useAuthContext } from 'utils/auth/AuthContext'
import { useSaved } from './useSaved'

export const Saved: FC = () => {
  const [auth] = useAuthContext()
  const { loading, error, savedRecipes } = useSaved()

  if (!auth.loggedIn) return <NotLoggedIn />
  if (loading)
    return (
      <>
        <p>Saved</p>
        Loading saved recipes…
      </>
    )
  if (error)
    return (
      <>
        <p>Saved</p>
        <h4>error</h4>
        Couldn't load saved recipes
      </>
    )
  return (
    <>
      <p>Saved</p>
      <RecipeCardContainer
        results={savedRecipes}
        onSavedPage={true}
        loading={loading}
      />
    </>
  )
}
