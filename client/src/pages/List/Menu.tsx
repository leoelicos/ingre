import { translate, useT } from '../../i18n'
import type { FC } from 'react'
import { useState } from 'react'
import { Button } from 'react-aria-components'
import type { LibraryRecipe } from '../../types/library'
import type { ChipsState } from '../../utils/chips/useChips'
import type { Clash, Course, CourseRow } from '../../utils/menu/menu'
import { clashOf, composeMenu, infoOf } from '../../utils/menu/menu'
import { Section } from './Section'

export const COURSE_TITLE: Readonly<Record<Course, string>> = {
  starter: translate('menu.starter'),
  main: translate('menu.main'),
  dessert: translate('menu.dessert')
}

const NONE_TEXT: Readonly<Record<Course, string>> = {
  starter: translate('menu.noStarter'),
  main: '',
  dessert: translate('menu.noDessert')
}

export const CLASH_REASON: Readonly<
  Record<Clash, (name: string, main: string) => string>
> = {
  protein: (name, main) => translate('menu.clashProtein', { name, main }),
  heavy: (name, main) => translate('menu.clashHeavy', { name, main })
}

const ADD_BUTTON =
  'inline-flex min-h-[44px] items-center justify-center rounded-control border border-primary bg-primary px-3 text-on-primary data-[focus-visible]:focus-ring'

const ITEM =
  'flex min-w-0 flex-col gap-1 rounded-card bg-bg p-3 shadow-recessed'

/** A recipe's wine, or nothing for a recipe nobody has described. */
export const WineLine: FC<{ recipe: LibraryRecipe }> = ({ recipe }) => {
  const t = useT()
  const { wine } = infoOf(recipe.id)
  return wine === null ? null : (
    <p className="m-0 text-sm text-text-secondary">
      <span className="font-semibold text-text">
        {t('menu.wine', { name: wine.name })}
      </span>
      {` ${wine.why}`}
    </p>
  )
}

/** Why a picked starter or dessert may not suit the main, in words. */
const ClashNote: FC<{
  recipe: LibraryRecipe
  mains: readonly LibraryRecipe[]
}> = ({ recipe, mains }) => {
  const t = useT()
  const found = clashOf(recipe, mains)
  return found === null ? null : (
    <p className="m-0 text-sm font-semibold text-text">
      {t('menu.check', {
        reason: CLASH_REASON[found.clash](recipe.name, found.main.name)
      })}
    </p>
  )
}

const PickedItem: FC<{
  recipe: LibraryRecipe
  mains: readonly LibraryRecipe[]
}> = ({ recipe, mains }) => {
  const t = useT()
  return (
    <li className={ITEM}>
      <p className="m-0 font-semibold text-text">{recipe.name}</p>
      <p className="m-0 text-sm text-text-secondary">{t('menu.onList')}</p>
      <ClashNote
        recipe={recipe}
        mains={mains}
      />
      <WineLine recipe={recipe} />
    </li>
  )
}

const SuggestedItem: FC<{
  recipe: LibraryRecipe
  onAdd: (recipe: LibraryRecipe) => void
}> = ({ recipe, onAdd }) => {
  const t = useT()
  return (
    <li className={ITEM}>
      <p className="m-0 font-semibold text-text">{recipe.name}</p>
      <p className="m-0 text-sm text-text-secondary">{t('menu.suggested')}</p>
      <WineLine recipe={recipe} />
      <Button
        aria-label={t('menu.add', { name: recipe.name })}
        onPress={() => onAdd(recipe)}
        className={`${ADD_BUTTON} self-start`}
      >
        <span aria-hidden="true">+</span>
        <span className="ml-2">{recipe.name}</span>
      </Button>
    </li>
  )
}

const Course: FC<{
  row: CourseRow
  mains: readonly LibraryRecipe[]
  onAdd: (recipe: LibraryRecipe) => void
}> = ({ row, mains, onAdd }) => {
  const empty =
    row.picked.length + row.suggestions.length === 0 && row.course !== 'main'
  return (
    <li
      aria-labelledby={`menu-${row.course}`}
      className="flex min-w-0 flex-col gap-2"
    >
      <h3
        id={`menu-${row.course}`}
        className="m-0 text-base font-bold text-text"
      >
        {COURSE_TITLE[row.course]}
      </h3>
      {empty && (
        <p className="m-0 text-text-secondary">{NONE_TEXT[row.course]}</p>
      )}
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {row.picked.map((recipe) => (
          <PickedItem
            key={recipe.id}
            recipe={recipe}
            mains={mains}
          />
        ))}
        {row.suggestions.map((recipe) => (
          <SuggestedItem
            key={recipe.id}
            recipe={recipe}
            onAdd={onAdd}
          />
        ))}
      </ul>
    </li>
  )
}

/**
 * Composed menus (#219): for the recipes on the list, a starter, main and dessert that suit
 * each other, each with a wine. Where a course is empty it suggests recipes that suit the
 * main, one tap to add. Shown once something is picked.
 */
export const Menu: FC<{ list: ChipsState; collapsible: boolean }> = ({
  list,
  collapsible
}) => {
  const t = useT()
  const [open, setOpen] = useState(true)
  const picked = list.entries.map((entry) => entry.recipe)
  const menu = composeMenu(picked)
  const mains = menu.rows.flatMap((row) =>
    row.course === 'main' ? row.picked : []
  )
  const courses = menu.rows.filter((row) => row.picked.length > 0).length
  return picked.length === 0 ? null : (
    <Section
      id="menu"
      title={t('menu.title')}
      collapsible={collapsible}
      open={open}
      onToggle={() => setOpen(!open)}
      summary={t('menu.courses', { count: courses })}
    >
      {menu.anchored ? (
        <ol className="m-0 flex list-none flex-col gap-4 p-0">
          {menu.rows.map((row) => (
            <Course
              key={row.course}
              row={row}
              mains={mains}
              onAdd={list.togglePicked}
            />
          ))}
        </ol>
      ) : (
        <p className="m-0 text-text-secondary">{t('menu.hint')}</p>
      )}
    </Section>
  )
}
