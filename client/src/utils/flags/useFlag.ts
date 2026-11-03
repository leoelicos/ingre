import { useState } from 'react'
import type { Flag } from './flags'
import { isEnabled, resolveFlags } from './flags'

/** Whether a feature flag is on for this device. Read once per mount. */
export const useFlag = (flag: Flag): boolean => {
  const [enabled] = useState(() =>
    isEnabled(flag, resolveFlags(window.location.search))
  )
  return enabled
}
