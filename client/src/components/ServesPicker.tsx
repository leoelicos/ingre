import type { FC } from 'react'
import { useId } from 'react'
import { IngreIconServes } from '../lib/icon/Icon'
import type { People } from '../utils/storage/people'
import { PEOPLE_OPTIONS } from '../utils/storage/people'
import '../styles/segmented.css'

/** "Serves 1 / 2 / 3" radio group, shared by every screen that scales recipes. */
export const ServesPicker: FC<{
  people: People
  onChange: (people: People) => void
}> = ({ people, onChange }) => {
  const id = useId()
  return (
    <div className="serves">
      <span
        id={id}
        className="serves__label"
      >
        <IngreIconServes />
        Serves
      </span>
      <div
        className="segmented"
        role="radiogroup"
        aria-labelledby={id}
      >
        {PEOPLE_OPTIONS.map((option) => (
          <label
            key={option}
            className="segmented__option"
          >
            <input
              type="radio"
              name={`serves-${id}`}
              value={option}
              checked={people === option}
              onChange={() => onChange(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
