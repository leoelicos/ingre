import type { ClientRecipe } from '../../types/client'
import type { FC } from 'react'
import RecipeCardContainer from '../../components/Widgets/RecipeCard/RecipeCardContainer'
import { options } from './options'
import { useSearch } from './useSearch'

const Search: FC = () => {
  const {
    searchText,
    onSearchChange,
    loadingEdamam,
    edamamRecipes,
  } = useSearch()
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
        <ul>
          {options.map(({ label, value: _valueParent, children }) => (
            <li>
              {label}
              <ul>
                {children.map(({ label, value }) => (
                  <li>
                    <input
                      type="checkbox"
                      id={value}
                    />{' '}
                    <label htmlFor={value}>{label}</label>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </form>
      {loadingEdamam ? (
        'Loading…'
      ) : (
        <RecipeCardContainer
          results={edamamRecipes as ClientRecipe[]}
          loading={loadingEdamam}
          onSavedPage={false}
        />
      )}
    </>
  )
}

export default Search
