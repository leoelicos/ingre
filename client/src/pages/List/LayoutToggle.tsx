import { translate } from '../../i18n'
import type { FC } from 'react'
import { Label, Radio, RadioGroup } from 'react-aria-components'
import type { Split } from '../../utils/layout/split'
import { SPLIT_LABELS } from '../../utils/layout/split'

const CHOICE =
  'inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-pill bg-bg px-3 text-sm font-semibold text-text shadow-raised data-[selected]:shadow-pressed data-[selected]:text-primary data-[focus-visible]:focus-ring'

/** The short text on each choice; the full split is its accessible name. */
const SHORT: Readonly<Record<Split, string>> = {
  vertical: translate('layout.vertical'),
  '50/50': '50/50',
  '25/75': '25/75',
  '33/33/33': '33/33/33',
  '75/25': '75/25'
}

/**
 * The layout toggle (#181): from 576px, vertical or 50/50; from 1328px also 25/75, 33/33/33 and
 * 75/25 (#193), in that order.
 * Radios, so VoiceOver reads the choice and which one is on. Hidden when there is no choice.
 */
export const LayoutToggle: FC<{
  split: Split
  options: readonly Split[]
  onChange: (split: Split) => void
}> = ({ split, options, onChange }) =>
  options.length === 0 ? null : (
    <RadioGroup
      value={split}
      onChange={(value) =>
        options
          .filter((option) => option === value)
          .forEach((option) => onChange(option))
      }
      orientation="horizontal"
      className="flex flex-wrap items-center justify-end gap-2"
    >
      <Label className="text-sm font-semibold text-text-secondary">
        {translate('layout.label')}
      </Label>
      {options.map((option) => (
        <Radio
          key={option}
          value={option}
          aria-label={SPLIT_LABELS[option]}
          className={CHOICE}
        >
          {SHORT[option]}
        </Radio>
      ))}
    </RadioGroup>
  )
