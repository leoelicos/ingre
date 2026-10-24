import { useStored } from '../storage/useStored'
import {
  SPLIT_MIN_WIDTH,
  WIDE_MIN_WIDTH,
  useMinWidth
} from '../media/useMinWidth'
import type { Split } from './split'
import {
  DEFAULT_SPLIT,
  SPLIT_KEY,
  effectiveSplit,
  parseSplit,
  splitOptions
} from './split'

/**
 * The preferred split is kept on this device, so a refresh keeps it, and so does a window that
 * shrinks below 992px (shown as 50/50) and grows again (#181).
 */
export const useSplit = () => {
  const splitWidth = useMinWidth(SPLIT_MIN_WIDTH)
  const wideWidth = useMinWidth(WIDE_MIN_WIDTH)
  const [preferred, update] = useStored<Split>(
    SPLIT_KEY,
    parseSplit,
    DEFAULT_SPLIT
  )
  return {
    split: effectiveSplit(preferred, splitWidth, wideWidth),
    options: splitOptions(splitWidth, wideWidth),
    wide: wideWidth,
    choose: (split: Split) => update(() => split)
  }
}
