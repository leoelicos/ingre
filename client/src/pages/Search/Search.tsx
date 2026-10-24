import type { FC } from 'react'
import RecipeCardContainer from '../../components/Widgets/RecipeCard/RecipeCardContainer'
import { useSearch } from './useSearch'

const Search: FC = () => {
  const { searchText, onSearchChange, loadingRecipes, libraryRecipes } =
    useSearch()
  return (
    <>
      <p>Search</p>
      <form>
        <input
          value={searchText}
          placeholder="Search"
          onChange={onSearchChange}
          type="text"
        />
      </form>
      {loadingRecipes ? (
        'Loading…'
      ) : (
        <RecipeCardContainer
          results={libraryRecipes}
          loading={loadingRecipes}
        />
      )}
    </>
  )
}

export default Search
