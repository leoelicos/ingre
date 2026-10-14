import type { FC } from 'react'
import RecipeCardContainer from '../../components/Widgets/RecipeCard/RecipeCardContainer'
import { ServesPicker } from '../../components/ServesPicker'
import { NARROW_QUERY, useMediaQuery } from '../../utils/useMediaQuery'
import { tagLabel } from './homeFilters'
import { useHome } from './useHome'
import '../../styles/segmented.css'
import './home.css'

const Home: FC = () => {
  const {
    query,
    setQuery,
    tags,
    selectedTags,
    onToggleTag,
    people,
    setPeople,
    recipes
  } = useHome()
  const narrow = useMediaQuery(NARROW_QUERY)
  return (
    <main className="ingre-page">
      <div className="home-strip">
        <label
          className="home-search"
          htmlFor="home-search"
        >
          <span className="visually-hidden">Search recipes</span>
          <input
            id="home-search"
            type="search"
            placeholder={
              narrow
                ? 'Search an ingredient'
                : "What's on the shelf? e.g. apples"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <ServesPicker
          people={people}
          onChange={setPeople}
        />
      </div>
      <ul
        className="chip-row"
        aria-label="Filter by tag"
      >
        {tags.map((tag) => (
          <li key={tag}>
            <button
              type="button"
              className="chip"
              aria-pressed={selectedTags.includes(tag)}
              onClick={() => onToggleTag(tag)}
            >
              {tagLabel(tag)}
            </button>
          </li>
        ))}
      </ul>
      <RecipeCardContainer
        results={recipes}
        loading={false}
        onSavedPage={false}
      />
    </main>
  )
}

export default Home
