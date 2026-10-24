import type { FC } from 'react'
import { Switch } from 'react-aria-components'
import { HeartIcon } from '../../components/SaveButton'

export const SAVED_FILTER_LABEL = 'Saved'

const SAVED_SWITCH =
  'inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-1 self-start rounded-pill border border-border px-[14px] py-1 text-sm text-text data-[selected]:border-primary data-[selected]:bg-chip-active data-[selected]:text-added-pill data-[focus-visible]:focus-ring'

/**
 * The Saved filter (#160): a switch, so VoiceOver reads it as on or off. Hearts are saved on the
 * server when signed in (#182, F4); Saved is in Explore's filter only (answer 38).
 */
export const SavedFilter: FC<{
  on: boolean
  onChange: (on: boolean) => void
}> = ({ on, onChange }) => (
  <Switch
    isSelected={on}
    onChange={onChange}
    className={SAVED_SWITCH}
  >
    <HeartIcon filled={on} />
    {SAVED_FILTER_LABEL}
  </Switch>
)
