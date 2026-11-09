import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Button, Input, Label, TextField } from 'react-aria-components'
import { Link } from 'react-router-dom'
import { translate, useT } from '../../i18n'
import type { LibraryIngredient } from '../../types/library'
import { capitaliseFirst } from '../../utils/capitaliseFirst'
import { changeTitle } from '../../utils/changeTitle'
import { focusById } from '../../utils/focus'
import { useChips } from '../../utils/chips/useChips'
import type { Capture } from '../../utils/warroom/capture'
import { autofill, captureOf, splitQuantity } from '../../utils/warroom/capture'
import { VoiceCapture } from './VoiceCapture'

/** What the War room put on the list this visit, newest first. */
interface Captured {
  readonly item: LibraryIngredient
  readonly quantity: number
}

const NAMES = (items: readonly LibraryIngredient[]): string =>
  items.map(({ name }) => capitaliseFirst(name)).join(', ')

const FIELD_ID = 'war-room-field'

const MATCH =
  'flex min-h-[44px] w-full items-center rounded-control bg-bg px-3 text-left text-sm font-semibold text-text shadow-chip data-[focus-visible]:focus-ring data-[pressed]:shadow-chip-pressed'

/** The same ingredient said twice in one go counts once. */
const distinct = (captures: readonly Capture[]): Capture[] =>
  captures.filter(
    (capture, i) =>
      capture.item === null ||
      captures.findIndex((other) => other.item?.id === capture.item?.id) === i
  )

/** One sentence of acknowledgement: what went on, what was there already, what was not understood. */
const sentence = (
  added: readonly LibraryIngredient[],
  already: readonly LibraryIngredient[],
  unmatched: readonly string[]
): string =>
  [
    added.length > 0 ? translate('warRoom.added', { names: NAMES(added) }) : '',
    already.length > 0
      ? translate('warRoom.already', { names: NAMES(already) })
      : '',
    unmatched.length > 0
      ? translate('warRoom.noMatch', { terms: unmatched.join(', ') })
      : ''
  ]
    .filter((part) => part !== '')
    .join('. ')

const Matches: FC<{
  items: readonly LibraryIngredient[]
  onPick: (item: LibraryIngredient) => void
}> = ({ items, onPick }) => {
  const t = useT()
  return items.length === 0 ? null : (
    <ul
      aria-label={t('warRoom.matches')}
      className="m-0 grid list-none grid-cols-2 gap-1 p-0 sm:grid-cols-3"
    >
      {items.map((item) => (
        <li key={item.id}>
          <Button
            aria-label={t('warRoom.add', { name: item.name })}
            onPress={() => onPick(item)}
            className={MATCH}
          >
            {capitaliseFirst(item.name)}
          </Button>
        </li>
      ))}
    </ul>
  )
}

const CapturedList: FC<{ captured: readonly Captured[] }> = ({ captured }) => {
  const t = useT()
  return captured.length === 0 ? null : (
    <section
      aria-labelledby="war-room-captured"
      className="flex flex-col gap-1"
    >
      <h2
        id="war-room-captured"
        className="m-0 text-sm font-semibold uppercase tracking-wide text-text-secondary"
      >
        {t('warRoom.capturedCount', { count: captured.length })}
      </h2>
      <ul
        aria-label={t('warRoom.captured')}
        className="m-0 list-none columns-2 gap-4 p-0 text-sm sm:columns-3"
      >
        {captured.map(({ item, quantity }) => (
          <li
            key={item.id}
            className="flex justify-between gap-2 border-b border-border py-1"
          >
            <span>{capitaliseFirst(item.name)}</span>
            {quantity > 1 && (
              <span className="tabular-nums text-text-secondary">{`×${quantity}`}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

/**
 * The War room (#207): a bare, flat capture list for the pre-shop sprint. Type or say what you
 * need; every match goes straight onto the shopping list with an inline acknowledgement. No
 * undo (the list itself is where things are changed), the compact suggestion badges wait for the suggestion engine (#204).
 */
export const WarRoom: FC = () => {
  const t = useT()
  useEffect(() => changeTitle(translate('warRoom.title')), [])
  const list = useChips()
  const [text, setText] = useState('')
  const [ack, setAck] = useState('')
  const [captured, setCaptured] = useState<readonly Captured[]>([])
  const take = (all: readonly Capture[]): void => {
    const found = distinct(all)
    const known = found.flatMap(({ item, quantity }) =>
      item === null ? [] : [{ item, quantity }]
    )
    const present = known.filter(({ item }) => list.hasChip(item.id))
    const fresh = known.filter(({ item }) => !list.hasChip(item.id))
    fresh.forEach(({ item, quantity }) => {
      list.addExtra(item)
      if (quantity > 1) list.setExtra(item.id, quantity)
    })
    setCaptured((before) => [...[...fresh].reverse(), ...before])
    setAck(
      sentence(
        fresh.map(({ item }) => item),
        present.map(({ item }) => item),
        found.flatMap(({ item, term }) => (item === null ? [term] : []))
      )
    )
    setText('')
  }
  const { quantity, term } = splitQuantity(text)
  /* a tap on a match gives focus back to the field, ready for the next one (not after voice) */
  const pick = (item: LibraryIngredient, count: number): void => {
    take([{ item, quantity: count, term: item.name }])
    focusById(FIELD_ID)
  }
  return (
    <div className="mx-auto flex w-full max-w-layout flex-col gap-3 px-gutter pb-24 pt-4">
      <h1 className="m-0 text-xl font-bold">{t('warRoom.title')}</h1>
      <p className="m-0 text-sm text-text-secondary">{t('warRoom.hint')}</p>
      <form
        className="flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          take(captureOf(text))
        }}
      >
        <TextField
          value={text}
          onChange={setText}
          className="flex min-w-0 flex-1 flex-col gap-1"
        >
          <Label className="sr-only">{t('warRoom.field')}</Label>
          <Input
            id={FIELD_ID}
            autoFocus
            autoComplete="off"
            autoCapitalize="none"
            enterKeyHint="done"
            placeholder={t('warRoom.field')}
            className="min-h-[44px] rounded-control border border-border bg-surface px-3 text-base text-text data-[focus-visible]:focus-ring"
          />
        </TextField>
      </form>
      <p
        role="status"
        className="m-0 min-h-[1.25rem] text-sm font-semibold text-text"
      >
        {ack}
      </p>
      <Matches
        items={autofill(term)}
        onPick={(item) => pick(item, quantity)}
      />
      <VoiceCapture onHeard={(heard) => take(captureOf(heard))} />
      <CapturedList captured={captured} />
      <Link
        to="/"
        className="inline-flex min-h-[44px] items-center self-start rounded-control px-2 text-sm font-semibold text-primary focus-visible:focus-ring"
      >
        {t('warRoom.back')}
      </Link>
    </div>
  )
}
