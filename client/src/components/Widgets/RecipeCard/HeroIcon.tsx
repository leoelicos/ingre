import type { FC } from 'react'
import { Icon } from '../../../lib/icon/Icon'
import type { Hero } from './recipeCardHelpers'

/** A beef cut (T-bone shape): no udder, so it never reads as dairy. */
const SteakIcon: FC = () => (
  <svg
    className="hero-steak"
    viewBox="0 0 24 24"
    width="1.15em"
    height="1em"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M14.5 3c3.9 0 7 2.6 7 6.3 0 2.4-1.2 4-2.8 5.4-1.8 1.6-3 3.1-3.9 4.9-1 2-2.6 3.4-5 3.4C5.6 23 2.5 20.4 2.5 16.8c0-2.6 1.6-4.2 3.1-5.5 1.5-1.3 2.5-2.6 3.3-4.6C10 4.6 11.9 3 14.5 3z" />
    <circle
      cx="14.6"
      cy="9.4"
      r="2.2"
      fill="var(--color-surface)"
    />
  </svg>
)

/** Recipe illustration: Font Awesome, or the custom steak. */
export const HeroIcon: FC<{ hero: Hero }> = ({ hero }) =>
  hero === 'steak' ? <SteakIcon /> : <Icon icon={['fas', hero]} />
