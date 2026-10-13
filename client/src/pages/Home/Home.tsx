import type { FC } from 'react'
import RecipeCardContainer from '../../components/Widgets/RecipeCard/RecipeCardContainer'
import { PEOPLE_OPTIONS } from '../../utils/storage/people'
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
            placeholder="What's on the shelf? e.g. apples"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div
          className="segmented"
          role="radiogroup"
          aria-label="People"
        >
          {PEOPLE_OPTIONS.map((option) => (
            <label
              key={option}
              className="segmented__option"
            >
              <input
                type="radio"
                name="people"
                value={option}
                checked={people === option}
                onChange={() => setPeople(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
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
              {tag}
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
