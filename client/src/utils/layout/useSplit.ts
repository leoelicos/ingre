import { useStored } from '../storage/useStored'
import {
  DRAWER_MIN_WIDTH,
  SPLIT_MIN_WIDTH,
  useMinWidth
} from '../media/useMinWidth'
import type { Split, Widths } from './split'
import {
  DEFAULT_SPLIT,
  SPLIT_KEY,
  effectiveSplit,
  parseSplit,
  splitOptions
} from './split'

/** The width breakpoints the viewport has reached; follows resizes. */
export const useWidths = (): Widths => ({
  split: useMinWidth(SPLIT_MIN_WIDTH),
  drawer: useMinWidth(DRAWER_MIN_WIDTH)
})

/**
 * The preferred split is kept on this device, so a refresh keeps it, and so does a window that
 * shrinks below where it is offered (shown as 50/50) and grows again (#181).
 */
export const useSplit = () => {
  const widths = useWidths()
  const [preferred, update] = useStored<Split>(
    SPLIT_KEY,
    parseSplit,
    DEFAULT_SPLIT
  )
  return {
    split: effectiveSplit(preferred, widths),
    options: splitOptions(widths),
    drawer: widths.drawer,
    choose: (split: Split) => update(() => split)
  }
}
