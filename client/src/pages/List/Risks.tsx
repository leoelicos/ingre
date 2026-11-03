import { formatMoney, translate, useT } from '../../i18n'
import type { FC, ReactNode } from 'react'
import { useState } from 'react'
import { Group, Input, Label, NumberField } from 'react-aria-components'
import { capitaliseFirst } from '../../utils/capitaliseFirst'
import type { ChipsState } from '../../utils/chips/useChips'
import type { Coverage, PickedRecipe } from '../../utils/risks/risks'
import {
  accessFor,
  budgetFor,
  fridgeFor,
  ovenRecipes,
  substitutesFor
} from '../../utils/risks/risks'
import { amountOrNull, useRiskSettings } from '../../utils/risks/riskSettings'
import { Section } from './Section'

const BOX =
  'h-11 w-24 rounded-control border border-border bg-surface px-2 text-center text-text focus-visible:focus-ring'
const LIST = 'm-0 flex list-none flex-col gap-1 p-0'

/** "Check: ..." in words, so colour is never the only sign of a flag. */
const Flag: FC<{ text: string }> = ({ text }) => (
  <p className="m-0 font-semibold text-text">
    {translate('risks.check', { what: text })}
  </p>
)

const Note: FC<{ text: string }> = ({ text }) => (
  <p className="m-0 text-text-secondary">{text}</p>
)

const Risk: FC<{ id: string; title: string; children: ReactNode }> = ({
  id,
  title,
  children
}) => (
  <li
    aria-labelledby={id}
    className="flex min-w-0 flex-col gap-2"
  >
    <h3
      id={id}
      className="m-0 text-base font-bold text-text"
    >
      {title}
    </h3>
    {children}
  </li>
)

/** A number the user sets; clearing it unsets it. */
const SettingField: FC<{
  label: string
  value: number | null
  onChange: (next: number | null) => void
}> = ({ label, value, onChange }) => (
  <NumberField
    value={value ?? NaN}
    minValue={0}
    formatOptions={{ maximumFractionDigits: 2 }}
    onChange={(next) => onChange(amountOrNull(next))}
    className="flex flex-wrap items-center gap-2"
  >
    <Label className="min-w-[8rem] flex-1 text-sm text-text-secondary">
      {label}
    </Label>
    <Group>
      <Input className={BOX} />
    </Group>
  </NumberField>
)

const OutOfStock: FC<{ picked: readonly PickedRecipe[] }> = ({ picked }) => {
  const advice = substitutesFor(picked)
  return advice.length === 0 ? (
    <Note text={translate('risks.outNone')} />
  ) : (
    <ul className={LIST}>
      {advice.map(({ item, use }) => (
        <li key={item.id}>
          {use === null
            ? translate('risks.outNoSubstitute', {
                name: capitaliseFirst(item.name)
              })
            : translate('risks.outUse', {
                name: capitaliseFirst(item.name),
                use
              })}
        </li>
      ))}
    </ul>
  )
}

/** The closest recipe not picked, or that none is near. */
export const AlternativeNote: FC<{ alternative: Coverage | null }> = ({
  alternative
}) => (
  <Note
    text={
      alternative === null
        ? translate('risks.accessNoAlternative')
        : alternative.missing === 0
        ? translate('risks.accessAlternativeReady', {
            name: alternative.recipe.name
          })
        : translate('risks.accessAlternative', {
            name: alternative.recipe.name,
            missing: alternative.missing
          })
    }
  />
)

const NoShop: FC<{
  picked: readonly PickedRecipe[]
  have: ReadonlySet<string>
}> = ({ picked, have }) => {
  const { picked: found, alternative } = accessFor(picked, have)
  return (
    <>
      <ul className={LIST}>
        {found.map(({ recipe, missing }) => (
          <li key={recipe.id}>
            {missing === 0
              ? translate('risks.accessReady', { name: recipe.name })
              : translate('risks.accessMissing', {
                  name: recipe.name,
                  count: missing
                })}
          </li>
        ))}
      </ul>
      {have.size === 0 && <Note text={translate('risks.accessHint')} />}
      <AlternativeNote alternative={alternative} />
    </>
  )
}

const BudgetResult: FC<{
  picked: readonly PickedRecipe[]
  budget: number | null
}> = ({ picked, budget }) => {
  if (budget === null) return <Note text={translate('risks.budgetUnset')} />
  const result = budgetFor(picked, budget)
  const money = {
    cost: formatMoney(result.cost),
    budget: formatMoney(result.budget)
  }
  return result.over === 0 ? (
    <Note text={translate('risks.budgetWithin', money)} />
  ) : (
    <>
      <Flag
        text={translate('risks.budgetOver', {
          ...money,
          over: formatMoney(result.over)
        })}
      />
      {result.drops.map(({ recipe, saving }) => (
        <Note
          key={recipe.id}
          text={translate('risks.budgetDrop', {
            name: recipe.name,
            saving: formatMoney(saving)
          })}
        />
      ))}
    </>
  )
}

const FridgeResult: FC<{
  picked: readonly PickedRecipe[]
  capacity: number | null
}> = ({ picked, capacity }) => {
  if (capacity === null) return <Note text={translate('risks.fridgeUnset')} />
  const result = fridgeFor(picked, capacity)
  const amounts = { litres: result.litres, capacity: result.capacity }
  return result.over === 0 ? (
    <Note text={translate('risks.fridgeFits', amounts)} />
  ) : (
    <Flag
      text={translate('risks.fridgeOver', { ...amounts, over: result.over })}
    />
  )
}

export const OvenResult: FC<{ picked: readonly PickedRecipe[] }> = ({
  picked
}) => {
  const needs = ovenRecipes(picked)
  return needs.length === 0 ? (
    <Note text={translate('risks.ovenNone')} />
  ) : (
    <Flag
      text={translate('risks.ovenUsed', {
        names: needs
          .map((recipe) => recipe.name)
          .join(translate('risks.listSeparator'))
      })}
    />
  )
}

/** How many of the checks the settings and the list say are failing. */
export const flagCount = (
  picked: readonly PickedRecipe[],
  budget: number | null,
  fridge: number | null
): number =>
  [
    budget !== null && budgetFor(picked, budget).over > 0,
    fridge !== null && fridgeFor(picked, fridge).over > 0,
    ovenRecipes(picked).length > 0
  ].filter(Boolean).length

/**
 * Risk handling (#220): five things that can go wrong with the list, each with what to do.
 * Shown once something is picked. Budget and fridge space are set here and kept on this device.
 */
export const Risks: FC<{ list: ChipsState; collapsible: boolean }> = ({
  list,
  collapsible
}) => {
  const t = useT()
  const [open, setOpen] = useState(true)
  const [settings, change] = useRiskSettings()
  const picked = list.entries.map(({ recipe, lines }) => ({ recipe, lines }))
  const flags = flagCount(picked, settings.budget, settings.fridge)
  return picked.length === 0 ? null : (
    <Section
      id="risks"
      title={t('risks.title')}
      collapsible={collapsible}
      open={open}
      onToggle={() => setOpen(!open)}
      summary={
        flags === 0 ? t('risks.clear') : t('risks.flags', { count: flags })
      }
    >
      <ul className="m-0 flex list-none flex-col gap-4 p-0">
        <Risk
          id="risk-out"
          title={t('risks.out')}
        >
          <OutOfStock picked={picked} />
        </Risk>
        <Risk
          id="risk-access"
          title={t('risks.access')}
        >
          <NoShop
            picked={picked}
            have={list.chipState.crossedIds}
          />
        </Risk>
        <Risk
          id="risk-budget"
          title={t('risks.budget')}
        >
          <SettingField
            label={t('risks.budgetLabel')}
            value={settings.budget}
            onChange={(budget) => change({ budget })}
          />
          <BudgetResult
            picked={picked}
            budget={settings.budget}
          />
        </Risk>
        <Risk
          id="risk-fridge"
          title={t('risks.fridge')}
        >
          <SettingField
            label={t('risks.fridgeLabel')}
            value={settings.fridge}
            onChange={(fridge) => change({ fridge })}
          />
          <FridgeResult
            picked={picked}
            capacity={settings.fridge}
          />
          <Note text={t('risks.fridgeNote')} />
        </Risk>
        <Risk
          id="risk-oven"
          title={t('risks.oven')}
        >
          <OvenResult picked={picked} />
        </Risk>
      </ul>
    </Section>
  )
}
