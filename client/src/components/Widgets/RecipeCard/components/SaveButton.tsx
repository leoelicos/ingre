import type { FC } from 'react'
import { useFavourite } from '../../../../utils/storage/favourites'

const HeartIcon: FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinejoin="round"
  >
    <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.6 3.9 4 7.4 4c2 0 3.6 1.1 4.6 2.7C13 5.1 14.6 4 16.6 4c3.5 0 5.8 3.6 4.6 7.1-1.7 4.8-9.2 9.4-9.2 9.4z" />
  </svg>
)

/** Heart: favourite on this device only; never asks to log in. */
export const SaveButton: FC<{ recipeName: string; libraryId: string }> = ({
  recipeName,
  libraryId
}) => {
  const [saved, toggle] = useFavourite(libraryId)
  return (
    <button
      type="button"
      className="icon-button"
      aria-label={saved ? `Unsave ${recipeName}` : `Save ${recipeName}`}
      aria-pressed={saved}
      onClick={toggle}
    >
      <HeartIcon filled={saved} />
    </button>
  )
}
