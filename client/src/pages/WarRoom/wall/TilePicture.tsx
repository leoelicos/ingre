import type { FC } from 'react'
import { useState } from 'react'
import type { Tile } from '../../../utils/warroom/rank'

const TONE_BG: Readonly<Record<string, string>> = {
  produce: 'bg-badge-produce text-badge-produce-ink',
  meat: 'bg-badge-meat text-badge-meat-ink',
  dairy: 'bg-badge-dairy text-badge-dairy-ink',
  fruit: 'bg-badge-fruit text-badge-fruit-ink',
  seafood: 'bg-badge-seafood text-badge-seafood-ink',
  deli: 'bg-badge-deli text-badge-deli-ink',
  bakery: 'bg-badge-bakery text-badge-bakery-ink',
  pantry: 'bg-badge-pantry text-badge-pantry-ink',
  frozen: 'bg-badge-frozen text-badge-frozen-ink',
  neutral: 'bg-badge-neutral text-badge-neutral-ink'
}

export const toneClass = (tone: string): string =>
  TONE_BG[tone] ?? 'bg-badge-neutral text-badge-neutral-ink'

/** Ingredients and recipes with no picture file: initials on the aisle's colour. */
export const initials = (name: string): string =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')

export const pictureSrc = (tile: Tile): string =>
  tile.kind === 'ingredient'
    ? `/ingredients/${tile.id}.svg`
    : `/recipes/${tile.id}.svg`

/** The tile's big picture (#290 pictograms, recipe dishes); decorative, the name is the label. */
export const TilePicture: FC<{ tile: Tile; size: number }> = ({
  tile,
  size
}) => {
  const [failed, setFailed] = useState(false)
  return failed ? (
    <span
      aria-hidden="true"
      data-testid="tile-fallback"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${toneClass(
        tile.tone
      )}`}
    >
      {initials(tile.name)}
    </span>
  ) : (
    <img
      src={pictureSrc(tile)}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
      style={{ width: size, height: size }}
      /* the pictograms leave a margin in their 120 box; drawn a third bigger, they fill the tile */
      className="shrink-0 scale-[1.35] select-none"
    />
  )
}
