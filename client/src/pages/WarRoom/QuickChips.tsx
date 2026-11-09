/*
 * One-tap adds and examples under an empty field (t26u): what was added lately, what is added
 * often, and examples of everything the field understands.
 */
import type { FC } from 'react'
import { Button } from 'react-aria-components'
import { useT } from '../../i18n'
import type { LibraryIngredient } from '../../types/library'
import { capitaliseFirst } from '../../utils/capitaliseFirst'
import { PROMPTS } from '../../utils/warroom/prompts'

export const CHIP =
  'inline-flex min-h-[44px] items-center rounded-pill bg-bg px-4 text-sm font-semibold text-text shadow-chip data-[focus-visible]:focus-ring data-[pressed]:shadow-chip-pressed'

const HEADING =
  'm-0 text-sm font-semibold uppercase tracking-wide text-text-secondary'

/** Examples on show at once in the empty state; the rest are under More examples. */
export const VISIBLE_PROMPTS = 6

const ItemChips: FC<{
  id: string
  heading: string
  items: readonly LibraryIngredient[]
  onAdd: (item: LibraryIngredient) => void
}> = ({ id, heading, items, onAdd }) => {
  const t = useT()
  return items.length === 0 ? null : (
    <section
      aria-labelledby={id}
      className="flex flex-col gap-1"
    >
      <h2
        id={id}
        className={HEADING}
      >
        {heading}
      </h2>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {items.map((item) => (
          <li key={item.id}>
            <Button
              aria-label={t('warRoom.add', { name: item.name })}
              onPress={() => onAdd(item)}
              className={CHIP}
            >
              {capitaliseFirst(item.name)}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}

const PromptChips: FC<{
  keys: readonly string[]
  onTry: (text: string) => void
}> = ({ keys, onTry }) => {
  const t = useT()
  return (
    <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
      {keys.map((key) => {
        const example = t(`warRoomEntry.prompts.${key}`)
        return (
          <li key={key}>
            <Button
              onPress={() => onTry(example)}
              className={`${CHIP} font-normal`}
            >
              {example}
            </Button>
          </li>
        )
      })}
    </ul>
  )
}

/** The examples from `start`, round the end, `count` of them. */
export const promptKeys = (start: number, count: number): string[] =>
  [...PROMPTS.slice(start), ...PROMPTS.slice(0, start)]
    .slice(0, count)
    .map(({ key }) => key)

export const QuickChips: FC<{
  recent: readonly LibraryIngredient[]
  frequent: readonly LibraryIngredient[]
  /** true before anything was ever added: the examples show without a click */
  firstTime: boolean
  /** the example the placeholder shows, so the visible ones turn over too */
  example: number
  onAdd: (item: LibraryIngredient) => void
  onTry: (text: string) => void
}> = ({ recent, frequent, firstTime, example, onAdd, onTry }) => {
  const t = useT()
  return (
    <div className="flex flex-col gap-3">
      <ItemChips
        id="war-room-recent"
        heading={t('warRoomEntry.recent')}
        items={recent}
        onAdd={onAdd}
      />
      <ItemChips
        id="war-room-frequent"
        heading={t('warRoomEntry.frequent')}
        items={frequent}
        onAdd={onAdd}
      />
      {firstTime && (
        <section
          aria-labelledby="war-room-try"
          className="flex flex-col gap-1"
        >
          <h2
            id="war-room-try"
            className={HEADING}
          >
            {t('warRoomEntry.tryHeading')}
          </h2>
          <PromptChips
            keys={promptKeys(example, VISIBLE_PROMPTS)}
            onTry={onTry}
          />
        </section>
      )}
      <details className="flex flex-col gap-2">
        <summary className="flex min-h-[44px] cursor-pointer items-center text-sm font-semibold text-primary focus-visible:focus-ring">
          {t('warRoomEntry.examples')}
        </summary>
        <p className="m-0 mb-2 text-sm text-text-secondary">
          {t('warRoomEntry.pasteHint')}
        </p>
        <PromptChips
          keys={PROMPTS.map(({ key }) => key)}
          onTry={onTry}
        />
      </details>
    </div>
  )
}
