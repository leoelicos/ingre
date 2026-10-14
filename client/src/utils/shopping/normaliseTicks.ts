/** Saved ticks after clean-up, plus whether anything changed. */
export interface Ticks {
  haveIds: ReadonlySet<string>
  basketIds: ReadonlySet<string>
}

const sameSet = (a: ReadonlySet<string>, b: ReadonlySet<string>) =>
  a.size === b.size && [...a].every((x) => b.has(x))

/**
 * Cleans ticks saved by an earlier session (UX rule, 2026-10-14):
 * - ticks for items no longer on the list are dropped (stale or older-schema ids, staples);
 * - an item both "have at home" and "in basket" keeps "have at home" and loses the basket tick,
 *   because items you have at home never appear At the shop.
 */
export const normaliseTicks = (
  listIds: ReadonlySet<string>,
  { haveIds, basketIds }: Ticks
): Ticks => {
  const have = new Set([...haveIds].filter((id) => listIds.has(id)))
  return {
    haveIds: have,
    basketIds: new Set(
      [...basketIds].filter((id) => listIds.has(id) && !have.has(id))
    )
  }
}

/** True when normalising changed nothing (so no write is needed). */
export const sameTicks = (a: Ticks, b: Ticks): boolean =>
  sameSet(a.haveIds, b.haveIds) && sameSet(a.basketIds, b.basketIds)
