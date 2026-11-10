import type { FC } from 'react'
import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { translate, useT } from '../../i18n'
import { changeTitle } from '../../utils/changeTitle'
import type { VoiceSetup } from '../../utils/voice/useVoiceCapture'
import { useWarRoom } from '../../utils/warroom/useWarRoom'
import type { Design } from './Designs'
import {
  ChecklistColumns,
  LIKELY,
  PosterGrid,
  SLOTS,
  ThumbBelt
} from './Designs'

const DESIGNS: readonly Design[] = ['a', 'b', 'c']

/** The layout on show: ?design=a|b|c (previews), A by default. */
export const designOf = (value: string | null): Design =>
  DESIGNS.find((design) => design === value) ?? 'a'

const useTablet = (): boolean =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(min-width: 600px)').matches

/**
 * The War room (#207, t27u–t34u): a utility belt for the pre-shop sprint. Everything is a big
 * picture to tap: tap adds one, tap again adds another, minus takes one off; type two letters
 * to narrow it, say it with the mic, or paste a list. No headings, no dialogs, nothing moves
 * under the thumb while tapping.
 */
export const WarRoom: FC<{ setup?: () => VoiceSetup }> = ({ setup }) => {
  const t = useT()
  useEffect(() => changeTitle(translate('warRoom.title')), [])
  const [params] = useSearchParams()
  const design = designOf(params.get('design'))
  const tablet = useTablet()
  const room = useWarRoom({
    likely: LIKELY[design] * (tablet ? 2 : 1),
    slots: SLOTS[design] * (tablet ? 2 : 1),
    setup
  })
  const Layout =
    design === 'b' ? ChecklistColumns : design === 'c' ? ThumbBelt : PosterGrid
  return (
    <div
      className="mx-auto -mt-[var(--space-nav-gap)] flex w-full max-w-layout flex-col px-gutter pb-24"
      data-design={design}
    >
      <h1 className="sr-only">{t('warRoom.title')}</h1>
      <Layout
        room={room}
        tablet={tablet}
      />
      <Link
        to="/"
        className="mt-2 inline-flex min-h-[44px] items-center self-start rounded-control px-2 text-sm font-semibold text-primary focus-visible:focus-ring"
      >
        {t('warRoom.back')}
      </Link>
    </div>
  )
}
