import type { FC } from 'react'
import RecipeCardContainer from '../../components/Widgets/RecipeCard/RecipeCardContainer'
import { options } from './options'
import { useSearch } from './useSearch'

type SearchViewProps = Pick<
  ReturnType<typeof useSearch>,
  'searchText' | 'onSearchChange' | 'loadingRecipes' | 'libraryRecipes'
>

/** The search screen for a given search state. */
export const SearchView: FC<SearchViewProps> = ({
  searchText,
  onSearchChange,
  loadingRecipes,
  libraryRecipes
}) => {
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

const Search: FC = () => <SearchView {...useSearch()} />

export default Search
