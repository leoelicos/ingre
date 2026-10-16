import type { FC } from 'react'
import { useState } from 'react'
import RecipeCardContainer from '../../components/Widgets/RecipeCard/RecipeCardContainer'
import { ServesPicker } from '../../components/ServesPicker'
import { PHONE_QUERY, useMediaQuery } from '../../utils/useMediaQuery'
import { IngreIconSearch } from '../../lib/icon/Icon'
import { tagLabel, visibleTags } from './homeFilters'
import { useHome } from './useHome'
import { EmptySearch } from './EmptySearch'
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
    recipes,
    pick
  } = useHome()
  const phone = useMediaQuery(PHONE_QUERY)
  const [moreOpen, setMoreOpen] = useState(false)
  const collapsed = phone && !moreOpen
  const shown = visibleTags(tags, selectedTags, collapsed)
  const hasMore = phone && visibleTags(tags, [], true).length < tags.length
  return (
    <main className="ingre-page">
      <div className="home-strip">
        <label
          className="home-search"
          htmlFor="home-search"
        >
          <span className="sr-only">Search recipes or ingredients</span>
          <span
            className="home-search__icon"
            aria-hidden="true"
          >
            <IngreIconSearch />
          </span>
          <input
            id="home-search"
            className="focus-visible:focus-ring"
            type="search"
            placeholder="Search recipes or ingredients"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <ServesPicker
          people={people}
          onChange={setPeople}
        />
      </div>
      <div className="chip-bar">
        <ul
          id="home-tags"
          className={collapsed ? 'chip-row chip-row--one' : 'chip-row'}
          aria-label="Filter by tag"
        >
          {shown.map((tag) => (
            <li key={tag}>
              <button
                type="button"
                className="chip focus-visible:focus-ring"
                aria-pressed={selectedTags.includes(tag)}
                onClick={() => onToggleTag(tag)}
                onFocus={(e) => {
                  const chip = e.currentTarget
                  const row = chip.closest('.chip-row')
                  if (!row || !row.classList.contains('chip-row--one')) return
                  const more = row.parentElement?.querySelector('.chip--more')
                  const moreWidth = more
                    ? more.getBoundingClientRect().width + 12
                    : 0
                  const chipRect = chip.getBoundingClientRect()
                  const rowRect = row.getBoundingClientRect()
                  if (chipRect.right > rowRect.right - moreWidth) {
                    row.scrollLeft +=
                      chipRect.right - (rowRect.right - moreWidth)
                  } else if (chipRect.left < rowRect.left) {
                    row.scrollLeft -= rowRect.left - chipRect.left
                  }
                }}
              >
                {tagLabel(tag)}
              </button>
            </li>
          ))}
        </ul>
        {hasMore && (
          <button
            type="button"
            className="chip chip--more focus-visible:focus-ring"
            aria-expanded={moreOpen}
            aria-controls="home-tags"
            onClick={() => setMoreOpen(!moreOpen)}
          >
            {moreOpen ? 'Less ▴' : 'More ▾'}
          </button>
        )}
      </div>
      {recipes.length === 0 && query.trim() !== '' ? (
        <EmptySearch query={query} />
      ) : (
        <RecipeCardContainer
          results={recipes}
          loading={false}
          pick={pick}
        />
      )}
    </main>
  )
}

export default Home
