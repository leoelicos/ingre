import { useT } from '../../i18n'
import type { FC } from 'react'
import { Button } from 'react-aria-components'
import { useExplore } from '../../utils/explore/ExploreContext'

/** The primary button of the bottom-right area (#210): open Explore and put the cursor in search. */
export const AddFab: FC = () => {
  const t = useT()
  const explore = useExplore()
  return (
    <Button
      aria-label={t('bra.add')}
      onPress={() => {
        explore.show()
        explore.requestFocus()
      }}
      className="inline-flex h-14 w-14 items-center justify-center rounded-pill bg-primary text-3xl font-semibold text-on-primary shadow-raised data-[focus-visible]:focus-ring"
    >
      <span aria-hidden="true">+</span>
    </Button>
  )
}
