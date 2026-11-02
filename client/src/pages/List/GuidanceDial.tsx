import { useT } from '../../i18n'
import { useId } from 'react'
import type { FC } from 'react'
import { Label, Slider, SliderThumb, SliderTrack } from 'react-aria-components'
import { useExplore } from '../../utils/explore/ExploreContext'
import {
  GUIDANCE_MODES,
  guidanceAt,
  guidanceIndex
} from '../../utils/guidance/guidance'

/**
 * The Explore dial (#206): drag, or use the arrow keys, Home and End, to move between
 * Self-directed and Hand-held. Four stops, each named: the range input only knows 0 to 3, so the
 * name is its description. React Aria sets aria-valuetext itself and ignores a custom one, and the
 * name is a plain span, not an output, which would be a second live status region.
 */
export const GuidanceDial: FC = () => {
  const t = useT()
  const { guidance, setGuidance } = useExplore()
  const nameId = useId()
  return (
    <Slider
      minValue={0}
      maxValue={GUIDANCE_MODES.length - 1}
      step={1}
      value={guidanceIndex(guidance)}
      onChange={(index) => setGuidance(guidanceAt(index))}
      className="flex flex-col gap-1"
    >
      <div className="flex items-baseline justify-between gap-2">
        <Label className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          {t('guidance.title')}
        </Label>
        <span
          id={nameId}
          className="text-sm font-semibold text-text"
        >
          {t(`guidance.${guidance}`)}
        </span>
      </div>
      <SliderTrack className="relative mx-3 flex h-11 items-center">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-pill bg-border"
        />
        <SliderThumb
          aria-describedby={nameId}
          className="top-1/2 h-7 w-7 rounded-pill bg-primary shadow-chip data-[dragging]:shadow-chip-pressed data-[focus-visible]:focus-ring"
        />
      </SliderTrack>
      <ul
        aria-hidden="true"
        className="m-0 flex list-none justify-between gap-1 p-0 text-xs text-text-secondary"
      >
        {GUIDANCE_MODES.map((mode) => (
          <li key={mode}>{t(`guidance.${mode}`)}</li>
        ))}
      </ul>
    </Slider>
  )
}
