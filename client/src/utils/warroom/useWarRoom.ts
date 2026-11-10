/*
 * Everything the three War room layouts share (t27u–t34u): the wall's order, two-letter
 * search, the Ingredients / Recipes / Both toggle, tap to add with +1 and minus, Undo, typed
 * and pasted lines, voice, and suggestions that settle 600 ms after the last tap.
 */
import { useEffect, useState } from 'react'
import { translate } from '../../i18n'
import { capitaliseFirst } from '../capitaliseFirst'
import { useChips } from '../chips/useChips'
import { library } from '../library/recipeLibrary'
import { useStored } from '../storage/useStored'
import { browserSetup, useVoiceCapture } from '../voice/useVoiceCapture'
import type { VoiceSetup } from '../voice/useVoiceCapture'
import type { Capture } from './capture'
import { captureOf, splitQuantity } from './capture'
import { lineParts } from './entry'
import type { HistoryEntry } from './history'
import type { Kind, Tile } from './rank'
import {
  ALL_TILES,
  countsOf,
  KINDS,
  ofKind,
  scoreOf,
  searchTiles,
  wallOrder
} from './rank'
import { captureSpoken } from './spoken'
import type { Suggestion } from './suggest'
import { suggestionsFor } from './suggest'
import { useHistory } from './useHistory'

export const KIND_KEY = 'ingre.warRoom.kind'
const parseKind = (value: unknown): Kind | null =>
  KINDS.find((kind) => kind === value) ?? null

/** Suggestions wait this long after the last tap, so nothing moves while tapping. */
export const SETTLE_MS = 600

export interface LastAdd {
  readonly label: string
  readonly tile: Tile | null
  readonly undo: () => void
}

const byId = new Map(ALL_TILES.map((tile) => [tile.id, tile]))

export const useWarRoom = (options: {
  likely: number
  slots: number
  setup?: (() => VoiceSetup) | undefined
}) => {
  const list = useChips()
  const history = useHistory()
  const [kind, updateKind] = useStored<Kind>(KIND_KEY, parseKind, 'both')
  const [query, setQueryState] = useState('')
  const [order] = useState(() => wallOrder(history.entries, options.likely))
  const [last, setLast] = useState<LastAdd | null>(null)
  const [said, setSaid] = useState('')
  const counts = countsOf(history.entries)

  const quantityOf = (tile: Tile): number => {
    if (tile.kind === 'recipe') return list.pickedIds.has(tile.id) ? 1 : 0
    const chip = list.chips.find((c) => c.id === tile.id)
    return chip === undefined ? 0 : chip.extra ?? 1
  }

  const log = (tile: Tile, quantity = 1): Set<string> =>
    new Set(history.add([{ itemId: tile.id, quantity }]).map(({ id }) => id))

  const announce = (tile: Tile, count: number): void =>
    setSaid(
      count === 0
        ? translate('warRoomWall.offList', { name: capitaliseFirst(tile.name) })
        : translate('warRoomWall.onList', {
            name: capitaliseFirst(tile.name),
            count
          })
    )

  const tap = (tile: Tile, by = 1): void => {
    if (tile.kind === 'recipe') {
      if (list.pickedIds.has(tile.id)) {
        announce(tile, 1)
        return
      }
      list.togglePicked(tile.recipe)
      const ids = log(tile)
      announce(tile, 1)
      setLast({
        label: capitaliseFirst(tile.name),
        tile,
        undo: () => {
          list.togglePicked(tile.recipe)
          history.remove(ids)
          announce(tile, 0)
        }
      })
      return
    }
    const chip = list.chips.find((c) => c.id === tile.id)
    const before = chip?.extra ?? null
    if (before === null) {
      list.addExtra(tile.item)
      if (by > 1) list.setExtra(tile.id, by)
    } else list.setExtra(tile.id, before + by)
    const now = (before ?? 0) + by
    const ids = log(tile, by)
    announce(tile, now)
    setLast({
      label:
        now > 1
          ? `${capitaliseFirst(tile.name)} ×${now}`
          : capitaliseFirst(tile.name),
      tile,
      undo: () => {
        if (before === null) list.removeExtra(tile.id)
        else list.setExtra(tile.id, before)
        history.remove(ids)
        announce(tile, before ?? 0)
      }
    })
  }

  const minus = (tile: Tile): void => {
    if (tile.kind === 'recipe') {
      if (list.pickedIds.has(tile.id)) list.togglePicked(tile.recipe)
      announce(tile, 0)
      return
    }
    const chip = list.chips.find((c) => c.id === tile.id)
    const extra = chip?.extra ?? null
    if (extra === null) return
    if (extra > 1) list.setExtra(tile.id, extra - 1)
    else list.removeExtra(tile.id)
    announce(tile, extra - 1)
  }

  /** a typed, pasted or spoken line through the parser */
  const take = (all: readonly Capture[]): void => {
    const seen = new Set<string>()
    const known = all.flatMap(({ item, quantity }) => {
      if (item === null || seen.has(item.id)) return []
      seen.add(item.id)
      const tile = byId.get(item.id)
      return tile === undefined ? [] : [{ tile, quantity }]
    })
    const unmatched = all
      .filter(({ item }) => item === null)
      .map(({ term }) => term)
    known.forEach(({ tile, quantity }) => tap(tile, quantity))
    if (known.length > 1) {
      setSaid(
        translate('warRoom.added', {
          names: known.map(({ tile }) => capitaliseFirst(tile.name)).join(', ')
        })
      )
      setLast(null)
    }
    if (unmatched.length > 0)
      setSaid(translate('warRoom.noMatch', { terms: unmatched.join(', ') }))
  }

  /* the wall keeps one order for the whole visit (even across searches): tiles never move under a thumb */
  const setQuery = (next: string): void => setQueryState(next)

  const results =
    query.trim() === ''
      ? null
      : ofKind(searchTiles(query, history.entries), kind)

  /** Enter: one thing typed adds the top tile (what you see); a list goes through the parser. */
  const submit = (text: string): void => {
    const { head } = lineParts(text)
    const top = results?.[0]
    if (head === '' && top !== undefined) {
      tap(top, splitQuantity(text).quantity)
    } else take(captureOf(text))
    setQuery('')
  }

  const voice = useVoiceCapture(
    (heard) => take(captureSpoken(heard)),
    options.setup ?? browserSetup
  )

  /* suggestions settle after the last change, so the strip never shifts under a tapping thumb */
  const onList = new Set(list.chips.map((c) => c.id))
  const listKey = `${kind}|${[...onList].sort().join(',')}|${[...list.pickedIds]
    .sort()
    .join(',')}`
  const compute = (): Suggestion[] => {
    /* what is already on show at the top of the wall is one tap away: suggest something else */
    const shown = new Set(order.likely.map(({ id }) => id))
    const found = suggestionsFor(
      kind,
      onList,
      list.pickedIds,
      counts,
      options.slots * 3
    )
      .filter(({ tile }) => !shown.has(tile.id))
      .slice(0, options.slots)
    if (found.length >= options.slots) return found
    const taken = new Set(found.map(({ tile }) => tile.id))
    const recent = new Set(
      history.entries.slice(0, 12).map(({ itemId }) => itemId)
    )
    const pad = ofKind(ALL_TILES, kind)
      .filter(
        (tile) =>
          !taken.has(tile.id) && !shown.has(tile.id) && quantityOf(tile) === 0
      )
      .filter(
        (tile) => tile.kind === 'recipe' || (counts.get(tile.id) ?? 0) > 0
      )
      .sort((a, b) => scoreOf(b, counts, recent) - scoreOf(a, counts, recent))
      .slice(0, options.slots - found.length)
      .map(
        (tile): Suggestion => ({
          tile,
          reason:
            (counts.get(tile.id) ?? 0) > 0
              ? ({ type: 'usual' } as const)
              : ({ type: 'try' } as const)
        })
      )
    return [...found, ...pad]
  }
  const [suggestions, setSuggestions] = useState<readonly Suggestion[]>(compute)
  useEffect(() => {
    const timer = setTimeout(() => setSuggestions(compute()), SETTLE_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listKey])

  const clearHistory = (): void => {
    const before: readonly HistoryEntry[] = history.entries
    history.clear()
    setSaid(translate('warRoomEntry.cleared'))
    setLast({
      label: translate('warRoomEntry.cleared'),
      tile: null,
      undo: () => {
        history.restore(before)
        setSaid('')
      }
    })
  }

  return {
    kind,
    setKind: (next: Kind) => updateKind(() => next),
    query,
    setQuery,
    results,
    submit,
    wall: {
      likely: ofKind(order.likely, kind),
      rest: ofKind(order.rest, kind)
    },
    quantityOf,
    tap,
    minus,
    suggestions,
    last,
    undo: (): void => {
      last?.undo()
      setLast(null)
    },
    said,
    voice,
    clearHistory,
    paste: (lines: string) => take(captureOf(lines)),
    /** turns the placeholder's example over after every add */
    example: history.entries.length,
    recipesCount: library.length
  }
}

export type WarRoomState = ReturnType<typeof useWarRoom>
