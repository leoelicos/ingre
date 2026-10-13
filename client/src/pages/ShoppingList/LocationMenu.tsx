import type { FC } from 'react'
import { useState } from 'react'
import type { HomeLocation } from '../../types/library'
import { HOME_LOCATIONS } from '../../utils/library/parseLibrary'

/** Chip showing where an item lives at home; opens a menu of the 4 places. */
export const LocationMenu: FC<{
  name: string
  location: HomeLocation
  onChange: (location: HomeLocation) => void
}> = ({ name, location, onChange }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="location-menu">
      <button
        type="button"
        className="location-chip"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${name} is kept in ${location}. Change`}
        onClick={() => setOpen(!open)}
      >
        {location}
      </button>
      {open && (
        <ul
          role="menu"
          aria-label={`Where you keep ${name}`}
          className="location-menu__list"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false)
          }}
        >
          {HOME_LOCATIONS.map((option) => (
            <li
              key={option}
              role="none"
            >
              <button
                type="button"
                role="menuitemradio"
                aria-checked={option === location}
                onClick={() => {
                  onChange(option)
                  setOpen(false)
                }}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
