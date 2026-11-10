/*
 * The War room's controls, shared by the three layouts (t27u–t34u): one compact search field
 * with the mic inside it, a More menu, the Ingredients / Recipes / Both toggle, and the
 * last-add strip with Undo. None of them changes height while you tap.
 */
import {
  faEllipsisVertical,
  faMicrophone,
  faStop
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { FC } from 'react'
import { useEffect } from 'react'
import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  Radio,
  RadioGroup
} from 'react-aria-components'
import { useT } from '../../../i18n'
import type { Kind } from '../../../utils/warroom/rank'
import { KINDS } from '../../../utils/warroom/rank'
import { isList, listLines } from '../../../utils/warroom/entry'
import type { WarRoomState } from '../../../utils/warroom/useWarRoom'
import { promptKeys } from '../promptKeys'
import { TilePicture } from './TilePicture'

export const SEARCH_ID = 'war-room-field'
export const WALL_ID = 'war-room-wall'
const COUNT_ID = 'war-room-count'

const focusFirstTile = (): void => {
  document
    .querySelector<HTMLElement>(
      `#${WALL_ID} [data-tile], [data-wall] [data-tile]`
    )
    ?.focus()
}

/** "/" from anywhere on the page goes to the search field. */
export const useSlash = (): void =>
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      const el = event.target
      const typing =
        el instanceof HTMLElement &&
        (el.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))
      if (
        event.key !== '/' ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        typing
      )
        return
      event.preventDefault()
      document.getElementById(SEARCH_ID)?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

const MIC_ABOUT_ID = 'war-room-mic-about'

const MicButton: FC<{ room: WarRoomState }> = ({ room }) => {
  const t = useT()
  const { voice } = room
  const { engine } = voice.state
  if (engine === null) return null
  /* where the audio goes (Web Speech may send it to Google or Apple), and the first download */
  const about = [
    t(`warRoom.voice.${engine}`),
    voice.firstUseMegabytes > 0
      ? t('warRoom.firstUse', { size: voice.firstUseMegabytes })
      : ''
  ]
    .filter((line) => line !== '')
    .join(' ')
  return (
    <>
      <span
        id={MIC_ABOUT_ID}
        className="sr-only"
      >
        {about}
      </span>
      <Button
        aria-label={t('warRoom.talk')}
        aria-describedby={MIC_ABOUT_ID}
        aria-pressed={voice.active}
        onPress={voice.toggle}
        className={`absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full data-[focus-visible]:focus-ring ${
          voice.active
            ? 'bg-accent text-on-primary motion-safe:animate-pulse'
            : 'text-primary'
        }`}
      >
        <FontAwesomeIcon
          icon={voice.active ? faStop : faMicrophone}
          aria-hidden="true"
        />
      </Button>
    </>
  )
}

/** What the mic is doing, in one thin line (polite, and visible only while it matters). */
export const VoiceLine: FC<{ room: WarRoomState }> = ({ room }) => {
  const t = useT()
  const { state } = room.voice
  const text =
    state.error !== null
      ? t(`warRoom.voice.${state.error}`)
      : state.interim !== ''
      ? t('warRoom.voice.heard', { text: state.interim })
      : state.phase === 'listening'
      ? t('warRoom.voice.listening')
      : state.phase === 'starting'
      ? t('warRoom.voice.starting')
      : state.phase === 'transcribing'
      ? t('warRoom.voice.transcribing')
      : state.download !== null
      ? t('warRoom.voice.downloading', {
          loaded: (state.download.loaded / 1e6).toFixed(0),
          total: (state.download.total / 1e6).toFixed(0)
        })
      : ''
  return (
    <p
      aria-live="polite"
      className={`pointer-events-none absolute inset-x-2 -bottom-0.5 m-0 truncate text-[11px] italic leading-3 text-text-secondary ${
        text === '' ? 'sr-only' : ''
      }`}
    >
      {text}
    </p>
  )
}

export const SearchBar: FC<{ room: WarRoomState; example: number }> = ({
  room,
  example
}) => {
  const t = useT()
  useSlash()
  const count = room.results
  const exampleText = t(
    `warRoomEntry.prompts.${promptKeys(example, 1).join('')}`
  )
  return (
    <div className="flex w-full items-center gap-1">
      <div className="relative min-w-0 flex-1">
        <label
          htmlFor={SEARCH_ID}
          className="sr-only"
        >
          {t('warRoomWall.search')}
        </label>
        <input
          id={SEARCH_ID}
          type="search"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          aria-controls={WALL_ID}
          aria-describedby={COUNT_ID}
          aria-keyshortcuts="/"
          placeholder={t('warRoomEntry.placeholder', { example: exampleText })}
          value={room.query}
          onChange={(event) => room.setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              if (room.query.trim() !== '') room.submit(room.query)
            } else if (event.key === 'ArrowDown') {
              event.preventDefault()
              focusFirstTile()
            } else if (event.key === 'Escape' && room.query !== '') {
              event.preventDefault()
              room.setQuery('')
            } else if (
              event.key === 'z' &&
              (event.ctrlKey || event.metaKey) &&
              room.query === '' &&
              room.last !== null
            ) {
              event.preventDefault()
              room.undo()
            }
          }}
          onPaste={(event) => {
            const pasted = event.clipboardData.getData('text')
            if (!isList(pasted)) return
            event.preventDefault()
            room.paste(listLines(pasted))
          }}
          className="h-11 w-full rounded-pill border border-border bg-surface pl-3 pr-11 text-base text-text placeholder:text-placeholder focus-visible:focus-ring [&::-webkit-search-cancel-button]:hidden"
        />
        <MicButton room={room} />
        <VoiceLine room={room} />
      </div>
      <MenuTrigger>
        <Button
          aria-label={t('warRoomWall.more')}
          className="inline-flex h-11 w-9 shrink-0 items-center justify-center rounded-pill text-text-secondary data-[focus-visible]:focus-ring"
        >
          <FontAwesomeIcon
            icon={faEllipsisVertical}
            aria-hidden="true"
          />
        </Button>
        <Popover
          placement="bottom end"
          className="min-w-[10rem] rounded-control border border-border bg-surface p-1 shadow-card"
        >
          <Menu
            aria-label={t('warRoomWall.more')}
            className="outline-none"
            onAction={() => room.clearHistory()}
          >
            <MenuItem
              id="clear"
              className="flex min-h-[44px] cursor-pointer items-center rounded-control px-3 text-sm outline-none data-[focused]:bg-highlight"
            >
              {t('warRoomEntry.clear')}
            </MenuItem>
          </Menu>
        </Popover>
      </MenuTrigger>
      <p
        id={COUNT_ID}
        aria-live="polite"
        className="sr-only"
      >
        {count === null
          ? ''
          : count.length === 0
          ? t('warRoomWall.noResults')
          : t('warRoomWall.results', { count: count.length })}
      </p>
    </div>
  )
}

const KIND_LABEL: Readonly<Record<Kind, string>> = {
  both: 'warRoomWall.kindBoth',
  ingredients: 'warRoomWall.kindIngredients',
  recipes: 'warRoomWall.kindRecipes'
}

export const KindToggle: FC<{ room: WarRoomState }> = ({ room }) => {
  const t = useT()
  return (
    <RadioGroup
      aria-label={t('warRoomWall.kind')}
      orientation="horizontal"
      value={room.kind}
      onChange={(value) => room.setKind(value as Kind)}
      className="flex shrink-0 rounded-pill bg-highlight p-0.5 shadow-recessed"
    >
      {KINDS.map((kind) => (
        <Radio
          key={kind}
          value={kind}
          className="inline-flex h-9 cursor-pointer items-center rounded-pill px-2.5 text-xs font-semibold text-text-secondary data-[focus-visible]:focus-ring data-[selected]:bg-surface data-[selected]:text-text data-[selected]:shadow-chip"
        >
          {t(KIND_LABEL[kind])}
        </Radio>
      ))}
    </RadioGroup>
  )
}

/** The last add and its Undo, always the same size: nothing jumps when it fills in. */
export const LastStrip: FC<{ room: WarRoomState }> = ({ room }) => {
  const t = useT()
  const { last } = room
  return (
    <div className="flex h-9 min-w-0 flex-1 items-center justify-end gap-1">
      <p
        role="status"
        className="m-0 flex min-w-0 items-center gap-1 truncate text-xs font-semibold text-text"
      >
        {last?.tile != null && (
          <TilePicture
            tile={last.tile}
            size={20}
          />
        )}
        <span className="truncate">{room.said}</span>
      </p>
      <Button
        isDisabled={last === null}
        aria-label={
          last === null
            ? t('warRoomEntry.undo')
            : t('warRoomWall.undoLabel', { label: last.label })
        }
        onPress={room.undo}
        className="inline-flex h-9 shrink-0 items-center rounded-pill border-2 border-current px-3 text-xs font-semibold text-primary data-[disabled]:border-transparent data-[disabled]:text-transparent data-[focus-visible]:focus-ring"
      >
        {t('warRoomEntry.undo')}
      </Button>
    </div>
  )
}
