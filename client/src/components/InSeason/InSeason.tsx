import type { FC } from 'react'
import { useState } from 'react'
import { Button } from 'react-aria-components'
import { useT } from '../../i18n'
import type { Translate } from '../../i18n'
import type { LibraryIngredient, LibraryRecipe } from '../../types/library'
import { capitaliseFirst } from '../../utils/capitaliseFirst'
import { catalogue, library } from '../../utils/library/recipeLibrary'
import type { MicropaymentGateway } from '../../utils/micropayment/micropayment'
import {
  isUnlocked,
  readUnlocked,
  stubGateway,
  unlock
} from '../../utils/micropayment/micropayment'
import { SEASONS } from '../../utils/seasons/calendar'
import type {
  SeasonCalendar,
  SeasonalRecipe
} from '../../utils/seasons/seasons'
import {
  monthIn,
  seasonalIngredients,
  seasonalRecipes
} from '../../utils/seasons/seasons'

const HEADING =
  'm-0 mb-2 text-sm font-semibold uppercase tracking-wide text-text-secondary'

const BUTTON =
  'flex min-h-[44px] w-full flex-col items-start rounded-control bg-bg px-3 py-1 text-left text-text shadow-raised data-[pressed]:shadow-pressed data-[focus-visible]:focus-ring'

const names = (items: readonly LibraryIngredient[]): string =>
  items.map((item) => item.name).join(', ')

export interface InSeasonProps {
  /** the moment to read the month from: Sydney's month, whatever the device's zone */
  now: Date
  pickedIds: ReadonlySet<string>
  onTogglePicked: (recipe: LibraryRecipe) => void
  onList: (ingredientId: string) => boolean
  onAddIngredient: (item: LibraryIngredient) => void
  /** the stubbed micropayment (#218): off unless its flag is on */
  micropayments: boolean
  gateway?: MicropaymentGateway
  /** Sydney's calendar unless a test brings its own */
  calendar?: SeasonCalendar
}

const IngredientButtons: FC<
  Pick<InSeasonProps, 'onList' | 'onAddIngredient'> & {
    items: readonly LibraryIngredient[]
  }
> = ({ items, onList, onAddIngredient }) => {
  const t = useT()
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-1">
      {items.map((item) => {
        const name = capitaliseFirst(item.name)
        return (
          <li key={item.id}>
            <Button
              className={BUTTON}
              onPress={() => onAddIngredient(item)}
              aria-label={
                onList(item.id)
                  ? t('explore.onListLabel', { name })
                  : t('explore.add', { name: item.name })
              }
            >
              <span className="font-semibold">{name}</span>
            </Button>
          </li>
        )
      })}
    </ul>
  )
}

const RecipeButtons: FC<
  Pick<InSeasonProps, 'pickedIds' | 'onTogglePicked'> & {
    entries: readonly SeasonalRecipe[]
  }
> = ({ entries, pickedIds, onTogglePicked }) => {
  const t = useT()
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-1">
      {entries.map(({ recipe, inSeason }) => (
        <li key={recipe.id}>
          <Button
            className={BUTTON}
            aria-pressed={pickedIds.has(recipe.id)}
            onPress={() => onTogglePicked(recipe)}
          >
            <span className="font-semibold">
              {t('seasonality.pickRecipe', { name: recipe.name })}
            </span>
            <span className="text-xs text-text-secondary">
              {t('seasonality.uses', { items: names(inSeason) })}
            </span>
          </Button>
        </li>
      ))}
    </ul>
  )
}

/** The stubbed editor's pick (#218): "pays" through the stub gateway, and charges nothing. */
const EditorsPick: FC<{
  pick: SeasonalRecipe
  gateway: MicropaymentGateway
}> = ({ pick, gateway }) => {
  const t = useT()
  const productId = `pick:${pick.recipe.id}`
  const [unlocked, setUnlocked] = useState(() =>
    isUnlocked(readUnlocked(), productId)
  )
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const press = (): void => {
    setBusy(true)
    setFailed(false)
    unlock(gateway, productId)
      .then(() => setUnlocked(true))
      .catch(() => setFailed(true))
      .finally(() => setBusy(false))
  }
  return (
    <div className="flex flex-col gap-2">
      <h4 className={HEADING}>{t('seasonality.pick.title')}</h4>
      <p className="m-0 font-semibold">{pick.recipe.name}</p>
      {unlocked ? (
        <>
          <p
            role="status"
            className="m-0"
          >
            {t('seasonality.pick.unlocked')}
          </p>
          <p className="m-0">
            {t('seasonality.pick.why', { items: names(pick.inSeason) })}
          </p>
        </>
      ) : (
        <Button
          className={BUTTON}
          isDisabled={busy}
          onPress={press}
        >
          {busy
            ? t('seasonality.pick.unlocking')
            : t('seasonality.pick.unlock')}
        </Button>
      )}
      {failed && <p role="alert">{t('seasonality.pick.failed')}</p>}
    </div>
  )
}

const Title: FC<{ t: Translate; month: number }> = ({ t, month }) => (
  <>
    <h3 className={HEADING}>{t('seasonality.title')}</h3>
    <p className="m-0 mb-2">
      {t('seasonality.when', { month: t(`seasonality.months.${month}`) })}
    </p>
    <p className="m-0 mb-2 text-text-secondary">{t('seasonality.hint')}</p>
  </>
)

/**
 * Seasonality (#218), a group in Explore: what is in season in Sydney this month, and the
 * recipes that use it. A hint only: the recipe list below is untouched.
 */
export const InSeason: FC<InSeasonProps> = ({
  now,
  micropayments,
  gateway = stubGateway,
  calendar = SEASONS,
  ...controls
}) => {
  const t = useT()
  const month = monthIn(now, calendar.timeZone)
  const items = seasonalIngredients(calendar, month, catalogue)
  const recipes = seasonalRecipes(library, calendar, month, catalogue)
  const pick = recipes[0]
  return (
    <section
      aria-label={t('seasonality.title')}
      className="flex flex-col gap-3"
    >
      <Title
        t={t}
        month={month}
      />
      <div>
        <h4 className={HEADING}>{t('seasonality.ingredients')}</h4>
        <IngredientButtons
          items={items}
          onList={controls.onList}
          onAddIngredient={controls.onAddIngredient}
        />
      </div>
      {recipes.length > 0 && (
        <div>
          <h4 className={HEADING}>{t('seasonality.recipes')}</h4>
          <RecipeButtons
            entries={recipes}
            pickedIds={controls.pickedIds}
            onTogglePicked={controls.onTogglePicked}
          />
        </div>
      )}
      {micropayments && pick && (
        <EditorsPick
          pick={pick}
          gateway={gateway}
        />
      )}
    </section>
  )
}
