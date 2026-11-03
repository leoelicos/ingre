import type { FC, ReactNode } from 'react'
import { useState } from 'react'
import {
  Checkbox,
  CheckboxGroup,
  Input,
  Label,
  TextArea,
  Text,
  TextField
} from 'react-aria-components'
import { formatDay, formatMass, translate, useT } from '../../i18n'
import { capitaliseFirst } from '../../utils/capitaliseFirst'
import type { CopyEntry } from '../../utils/chips/chips'
import type { ChipsState } from '../../utils/chips/useChips'
import type { Label as CookLabel, Weigh } from '../../utils/cook/cook'
import {
  addDays,
  labelsFor,
  parseDay,
  prepPlan,
  sourcingFor,
  timedSteps,
  weighOut
} from '../../utils/cook/cook'
import { useCookSettings } from '../../utils/cook/cookSettings'
import { allergensOnList, needsCare, separate } from '../../utils/cook/diet'
import { amountText } from '../../utils/shopping/shoppingList'
import { Section } from './Section'

const FIELD =
  'min-h-11 rounded-control border border-border bg-surface px-3 py-2 text-text focus-visible:focus-ring'
const LIST = 'm-0 flex list-none flex-col gap-1 p-0'
const CHECK =
  'inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-pill border border-border px-3 text-sm data-[selected]:border-2 data-[selected]:border-primary data-[selected]:font-bold data-[focus-visible]:focus-ring'

const Note: FC<{ text: string }> = ({ text }) => (
  <p className="m-0 text-text-secondary">{text}</p>
)

const Block: FC<{ id: string; title: string; children: ReactNode }> = ({
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

const join = (names: readonly string[]): string =>
  names.join(translate('cook.listSeparator'))

/** A field the cook fills in; typing never fights the browser's own date entry. */
const Setting: FC<{
  label: string
  hint: string
  children: ReactNode
}> = ({ label, hint, children }) => (
  <>
    <Label className="text-sm font-semibold text-text">{label}</Label>
    {children}
    <Text
      slot="description"
      className="m-0 text-sm text-text-secondary"
    >
      {hint}
    </Text>
  </>
)

const DayField: FC<{
  day: string | null
  onChange: (day: string | null) => void
}> = ({ day, onChange }) => (
  <TextField
    type="date"
    defaultValue={day ?? ''}
    onChange={(value) => onChange(parseDay(value))}
    className="flex flex-col gap-1"
  >
    <Setting
      label={translate('cook.day')}
      hint={translate('cook.dayHint')}
    >
      <Input className={`${FIELD} max-w-[12rem]`} />
    </Setting>
  </TextField>
)

const KitchenField: FC<{
  kitchen: string
  onChange: (kitchen: string) => void
}> = ({ kitchen, onChange }) => (
  <TextField
    value={kitchen}
    onChange={onChange}
    className="flex flex-col gap-1"
  >
    <Setting
      label={translate('cook.kitchen')}
      hint={translate('cook.kitchenHint')}
    >
      <TextArea
        rows={2}
        className={FIELD}
      />
    </Setting>
  </TextField>
)

/** A day before the cook day: its date when the day is set, else "1 day before". */
const whenText = (day: string | null, daysBefore: number): string =>
  day === null
    ? translate('cook.daysBefore', { count: daysBefore })
    : formatDay(addDays(day, -daysBefore))

const PrepAhead: FC<{ picked: readonly CopyEntry[]; day: string | null }> = ({
  picked,
  day
}) => {
  const plan = prepPlan(picked)
  return plan.length === 0 ? (
    <Note text={translate('cook.prepNone')} />
  ) : (
    <ul className={LIST}>
      {plan.map(({ recipe, daysBefore, task }, index) => (
        <li key={`${recipe.id}-${index}`}>
          <strong>{whenText(day, daysBefore)}</strong>{' '}
          {translate('cook.prepLine', { name: recipe.name, task })}
        </li>
      ))}
    </ul>
  )
}

const TimedSteps: FC<{ picked: readonly CopyEntry[] }> = ({ picked }) => {
  const timed = picked
    .map((entry) => ({ entry, steps: timedSteps(entry.recipe) }))
    .filter(({ steps }) => steps.length > 0)
  return timed.length === 0 ? (
    <Note text={translate('cook.timedNone')} />
  ) : (
    <div className="flex flex-col gap-2">
      {timed.map(({ entry, steps }, index) => (
        <div
          key={`${entry.recipe.id}-${index}`}
          className="flex flex-col gap-1"
        >
          <h4 className="m-0 text-sm font-semibold text-text">{entry.label}</h4>
          <ul className={LIST}>
            {steps.map(({ number, text, timers }) => (
              <li key={number}>
                <strong>{join(timers.map((timer) => timer.text))}</strong>{' '}
                {translate('cook.timedStep', { number, text })}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

/** One ingredient as precisely as its unit allows, with the recipe's own amount beside an estimate. */
export const weighText = ({ line, amount, exact }: Weigh): string => {
  const name = capitaliseFirst(line.name)
  const own = amountText(line.quantity, line.measure, line.item)
  if (amount === null) return translate('cook.weighOwn', { name, own })
  const shown = formatMass(amount.amount, amount.unit === 'ml' ? 'ml' : 'g')
  return exact
    ? translate('cook.weighExact', { name, amount: shown })
    : translate('cook.weighAbout', { name, amount: shown, own })
}

const WeighOut: FC<{ picked: readonly CopyEntry[] }> = ({ picked }) => (
  <div className="flex flex-col gap-3">
    <Note text={translate('cook.weighHint')} />
    {picked.map((entry, index) => (
      <div
        key={`${entry.recipe.id}-${index}`}
        className="flex flex-col gap-1"
      >
        <h4 className="m-0 text-sm font-semibold text-text">
          {entry.label}{' '}
          <span className="font-normal text-text-secondary">
            {translate('cook.serves', { count: entry.copy.portions })}
          </span>
        </h4>
        <ul className={LIST}>
          {weighOut(entry).map((weigh) => (
            <li key={weigh.line.ingredientId}>{weighText(weigh)}</li>
          ))}
        </ul>
      </div>
    ))}
  </div>
)

const Sourcing: FC<{ picked: readonly CopyEntry[] }> = ({ picked }) => {
  const tips = sourcingFor(picked)
  return tips.length === 0 ? (
    <Note text={translate('cook.sourceNone')} />
  ) : (
    <ul className={LIST}>
      {tips.map(({ item, tip }) => (
        <li key={item.id}>
          <strong>{capitaliseFirst(item.name)}:</strong> {tip}
        </li>
      ))}
    </ul>
  )
}

/** The order that keeps a safe dish safe: it goes first, then everything is washed. */
export const CarePlan: FC<{
  safe: readonly string[]
  unsafe: readonly string[]
}> = ({ safe, unsafe }) => (
  <>
    <h4 className="m-0 text-sm font-semibold text-text">
      {translate('cook.dietOrder')}
    </h4>
    <ol className="m-0 flex list-decimal flex-col gap-1 pl-6">
      <li>{translate('cook.dietStep1', { safe: join(safe) })}</li>
      <li>{translate('cook.dietStep2')}</li>
      <li>{translate('cook.dietStep3', { unsafe: join(unsafe) })}</li>
      <li>{translate('cook.dietStep4')}</li>
    </ol>
  </>
)

const DietResult: FC<{
  picked: readonly CopyEntry[]
  avoid: readonly string[]
}> = ({ picked, avoid }) => {
  const result = separate(picked, new Set(avoid))
  const safe = result.safe.map((recipe) => recipe.name)
  const unsafe = result.unsafe.map(({ recipe }) => recipe.name)
  return (
    <>
      <ul className={LIST}>
        {result.unsafe.map(({ recipe, allergens }, index) => (
          <li
            key={`${recipe.id}-${index}`}
            className="font-semibold"
          >
            {translate('cook.dietContains', {
              name: recipe.name,
              allergens: join(allergens)
            })}
          </li>
        ))}
      </ul>
      {unsafe.length === 0 && <Note text={translate('cook.dietClear')} />}
      {safe.length === 0 && unsafe.length > 0 && (
        <Note text={translate('cook.dietNoneSafe')} />
      )}
      {safe.length > 0 && unsafe.length > 0 && (
        <Note text={translate('cook.dietSafe', { names: join(safe) })} />
      )}
      {needsCare(result) && (
        <CarePlan
          safe={safe}
          unsafe={unsafe}
        />
      )}
    </>
  )
}

const Diet: FC<{
  picked: readonly CopyEntry[]
  avoid: readonly string[]
  onChange: (avoid: string[]) => void
}> = ({ picked, avoid, onChange }) => {
  const options = [...new Set([...allergensOnList(picked), ...avoid])].sort()
  return options.length === 0 ? (
    <Note text={translate('cook.dietNone')} />
  ) : (
    <>
      <CheckboxGroup
        value={[...avoid]}
        onChange={onChange}
        className="flex flex-col gap-1"
      >
        <Label className="text-sm font-semibold">
          {translate('cook.dietLegend')}
        </Label>
        <div className="flex flex-wrap gap-2">
          {options.map((allergen) => (
            <Checkbox
              key={allergen}
              value={allergen}
              className={CHECK}
            >
              {capitaliseFirst(allergen)}
            </Checkbox>
          ))}
        </div>
      </CheckboxGroup>
      {avoid.length === 0 ? (
        <Note text={translate('cook.dietHint')} />
      ) : (
        <DietResult
          picked={picked}
          avoid={avoid}
        />
      )}
    </>
  )
}

/** One container label: its name, and when it was cooked and when to eat it by, or how long it keeps. */
export const labelText = (label: CookLabel, day: string | null): string => {
  const title =
    label.component === null
      ? label.name
      : translate('cook.labelPart', {
          item: capitaliseFirst(label.component.name),
          name: label.name
        })
  const when =
    day === null
      ? translate('cook.labelUndated', { count: label.days })
      : translate('cook.labelDated', {
          cooked: formatDay(day),
          eatBy: formatDay(addDays(day, label.days)),
          count: label.days
        })
  return `${title}. ${when}`
}

const Labels: FC<{ picked: readonly CopyEntry[]; day: string | null }> = ({
  picked,
  day
}) => (
  <>
    <Note text={translate('cook.labelsHint')} />
    <ul className={LIST}>
      {labelsFor(picked).map((label, index) => (
        <li key={`${label.name}-${label.component?.id ?? 'dish'}-${index}`}>
          {labelText(label, day)}
        </li>
      ))}
    </ul>
  </>
)

/**
 * Precise execution (#221): everything to do between picking recipes and eating them. Prep
 * that can be done days ahead, timed steps, exact weights, where to find special cuts,
 * how to cook around an allergy, and dated labels for the containers.
 * Shown once something is picked; the settings are kept on this device.
 */
export const CookPlan: FC<{ list: ChipsState; collapsible: boolean }> = ({
  list,
  collapsible
}) => {
  const t = useT()
  const [open, setOpen] = useState(true)
  const [settings, change] = useCookSettings()
  const picked = list.entries
  return picked.length === 0 ? null : (
    <Section
      id="cook"
      title={t('cook.title')}
      collapsible={collapsible}
      open={open}
      onToggle={() => setOpen(!open)}
      summary={settings.day === null ? '' : formatDay(settings.day)}
    >
      <div className="flex flex-col gap-4">
        <DayField
          day={settings.day}
          onChange={(day) => change({ day })}
        />
        <KitchenField
          kitchen={settings.kitchen}
          onChange={(kitchen) => change({ kitchen })}
        />
        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          <Block
            id="cook-prep"
            title={t('cook.prep')}
          >
            <PrepAhead
              picked={picked}
              day={settings.day}
            />
          </Block>
          <Block
            id="cook-timed"
            title={t('cook.timed')}
          >
            <TimedSteps picked={picked} />
          </Block>
          <Block
            id="cook-weigh"
            title={t('cook.weigh')}
          >
            <WeighOut picked={picked} />
          </Block>
          <Block
            id="cook-source"
            title={t('cook.source')}
          >
            <Sourcing picked={picked} />
          </Block>
          <Block
            id="cook-diet"
            title={t('cook.diet')}
          >
            <Diet
              picked={picked}
              avoid={settings.avoid}
              onChange={(avoid) => change({ avoid })}
            />
          </Block>
          <Block
            id="cook-labels"
            title={t('cook.labels')}
          >
            <Labels
              picked={picked}
              day={settings.day}
            />
          </Block>
        </ul>
      </div>
    </Section>
  )
}
