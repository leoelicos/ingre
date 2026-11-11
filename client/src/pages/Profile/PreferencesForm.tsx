import { translate, useT } from '../../i18n'
import type { FC, FormEvent, ReactNode } from 'react'
import { useEffect, useId, useRef, useState } from 'react'
import { PrimaryButton } from '../../components/PrimaryButton'
import { capitaliseFirst } from '../../utils/capitaliseFirst'
import { FSANZ_ALLERGENS } from '../../utils/library/fsanz'
import type { Diet } from '../../utils/profile/locks'
import { DIETS } from '../../utils/profile/locks'
import { useProfileSettings } from '../../utils/profile/settings'
import type { Appearance, Theme } from '../../utils/preferences/appearance'
import {
  MAX_TEXT_SIZE,
  MIN_TEXT_SIZE,
  STANDARD_TEXT_SIZE,
  THEMES,
  applyAppearance,
  readAppearance,
  writeAppearance
} from '../../utils/preferences/appearance'
import type {
  CheckedField,
  FieldErrors
} from '../../utils/preferences/validate'
import {
  CHECKED_FIELDS,
  errorList,
  formErrors,
  readTextSize
} from '../../utils/preferences/validate'
import { revealById } from '../../utils/focus'

/*
 * Preferences on the Profile page: the colour theme and text size for the whole app, and the
 * diet and allergens Explore already filters by (#224). Native form controls in fieldsets, so
 * every browser and screen reader knows them; checked inline once a field is left, and all
 * together on submit with a summary that takes focus and links to each problem.
 */

/** Allergen families, as the locks match them: "gluten" covers "gluten (oats)" (#224). */
export const ALLERGEN_FAMILIES: readonly string[] = [
  ...new Set(FSANZ_ALLERGENS.map((name) => name.replace(/ \(.*\)$/, '')))
]

export const themeLabel = (theme: Theme): string => {
  switch (theme) {
    case 'system':
      return translate('preferences.themeSystem')
    case 'light':
      return translate('preferences.themeLight')
    case 'dark':
      return translate('preferences.themeDark')
  }
}

export const dietLabel = (diet: Diet): string => {
  switch (diet) {
    case 'none':
      return translate('preferences.dietNone')
    case 'pescatarian':
      return translate('preferences.dietPescatarian')
    case 'vegetarian':
      return translate('preferences.dietVegetarian')
    case 'vegan':
      return translate('preferences.dietVegan')
  }
}

interface Draft {
  readonly theme: Theme
  readonly textSize: string
  readonly diet: Diet
  readonly allergens: readonly string[]
}

const CARD = 'flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card'
const HEADING = 'm-0 text-xl font-semibold text-text'
const LEGEND = 'mb-1 p-0 text-lg font-semibold text-text'
const SUB_LEGEND = 'mb-1 p-0 font-semibold text-text'
const FIELDSET = 'm-0 flex min-w-0 flex-col gap-4 border-0 p-0'
const HINT = 'm-0 text-sm text-text-secondary'
const CHOICE =
  'flex min-h-[44px] cursor-pointer items-center gap-3 rounded-control px-1 text-text'
const MARK = 'h-5 w-5 shrink-0 accent-primary focus-visible:focus-ring'

const Choice: FC<{
  type: 'radio' | 'checkbox'
  name: string
  value: string
  checked: boolean
  onChange: () => void
  children: ReactNode
}> = ({ type, name, value, checked, onChange, children }) => (
  <label className={CHOICE}>
    <input
      type={type}
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className={MARK}
    />
    <span>{children}</span>
  </label>
)

/** A field's error: words, an icon and a hidden "Error:" so it never relies on colour. */
const FieldError: FC<{ id: string; message: string }> = ({ id, message }) => (
  <p
    id={id}
    className="m-0 flex items-start gap-2 font-semibold text-error"
  >
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      width="20"
      height="20"
      className="mt-0.5 shrink-0"
      fill="currentColor"
    >
      <path d="M10 1a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-1 4h2v6H9V5Zm0 8h2v2H9v-2Z" />
    </svg>
    <span>
      <span className="sr-only">{translate('preferences.errorPrefix')} </span>
      {message}
    </span>
  </p>
)

/** On submit with problems: takes focus, says how many, and links each one to its field. */
const ErrorSummary: FC<{
  errors: FieldErrors
  fieldIds: Readonly<Record<CheckedField, string>>
  focusKey: number
}> = ({ errors, fieldIds, focusKey }) => {
  const t = useT()
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useEffect(() => ref.current?.focus(), [focusKey])
  return (
    <div
      ref={ref}
      tabIndex={-1}
      aria-labelledby={titleId}
      className="rounded-card border-2 border-error p-4 focus-visible:focus-ring"
    >
      <h3
        id={titleId}
        className="m-0 text-lg font-semibold text-text"
      >
        {t('preferences.summaryTitle')}
      </h3>
      <ul className="m-0 mt-2 list-none p-0">
        {errorList(errors).map(({ field, message }) => (
          <li key={field}>
            <a
              href={`#${fieldIds[field]}`}
              onClick={(event) => {
                /* a fragment link scrolls but leaves focus behind; this moves it to the field */
                event.preventDefault()
                revealById(fieldIds[field])
              }}
              className="inline-flex min-h-[44px] items-center rounded-control font-semibold text-error underline focus-visible:focus-ring"
            >
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

const TextSizeField: FC<{
  id: string
  value: string
  error: string | null
  onChange: (value: string) => void
  onBlur: () => void
}> = ({ id, value, error, onChange, onBlur }) => {
  const t = useT()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="font-semibold text-text"
      >
        {t('preferences.textSize.label')}
      </label>
      <p
        id={hintId}
        className={HINT}
      >
        {t('preferences.textSize.hint', {
          min: MIN_TEXT_SIZE,
          max: MAX_TEXT_SIZE,
          standard: STANDARD_TEXT_SIZE
        })}
      </p>
      {error !== null && (
        <FieldError
          id={errorId}
          message={error}
        />
      )}
      <div className="flex items-center gap-2">
        <input
          id={id}
          name="textSize"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          aria-invalid={error !== null}
          aria-describedby={error === null ? hintId : `${hintId} ${errorId}`}
          className={`min-h-[44px] w-24 rounded-control bg-surface px-3 text-text focus-visible:focus-ring ${
            error === null ? 'border border-border' : 'border-2 border-error'
          }`}
        />
        <span
          aria-hidden="true"
          className="text-text"
        >
          {t('preferences.textSize.unit')}
        </span>
      </div>
    </div>
  )
}

const toggled = (list: readonly string[], item: string): string[] =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item]

const draftFrom = (
  appearance: Appearance,
  locks: { diet: Diet; allergens: readonly string[] }
): Draft => ({
  theme: appearance.theme,
  textSize: String(appearance.textSize),
  diet: locks.diet,
  allergens: locks.allergens
})

export const PreferencesForm: FC = () => {
  const t = useT()
  const id = useId()
  const [settings, updateSettings] = useProfileSettings()
  const [draft, setDraft] = useState<Draft>(() =>
    draftFrom(readAppearance(), settings)
  )
  const [touched, setTouched] = useState<ReadonlySet<CheckedField>>(new Set())
  const [submits, setSubmits] = useState(0)
  const [summary, setSummary] = useState(false)
  const [status, setStatus] = useState('')
  const fieldIds: Record<CheckedField, string> = { textSize: `${id}-text-size` }
  const errors = formErrors(draft)
  const shownError = (field: CheckedField): string | null =>
    touched.has(field) ? errors[field] ?? null : null
  const change = (next: Partial<Draft>) => {
    setDraft((previous) => ({ ...previous, ...next }))
    setStatus('')
  }
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTouched(new Set(CHECKED_FIELDS))
    setSubmits((n) => n + 1)
    const textSize = readTextSize(draft.textSize)
    if (Object.keys(errors).length > 0 || textSize === null) {
      setSummary(true)
      setStatus('')
      return
    }
    setSummary(false)
    const appearance: Appearance = { theme: draft.theme, textSize }
    writeAppearance(appearance)
    applyAppearance(appearance)
    updateSettings((previous) => ({
      ...previous,
      diet: draft.diet,
      allergens: draft.allergens
    }))
    setDraft((previous) => ({ ...previous, textSize: String(textSize) }))
    setStatus(t('preferences.saved'))
  }
  const hasErrors = Object.keys(errors).length > 0
  return (
    <section
      aria-labelledby={`${id}-title`}
      className={CARD}
    >
      <h2
        id={`${id}-title`}
        className={HEADING}
      >
        {t('preferences.title')}
      </h2>
      <p className="m-0 text-text">{t('preferences.intro')}</p>
      <form
        noValidate
        aria-labelledby={`${id}-title`}
        onSubmit={onSubmit}
        className="flex flex-col gap-6"
      >
        {summary && hasErrors && (
          <ErrorSummary
            errors={errors}
            fieldIds={fieldIds}
            focusKey={submits}
          />
        )}
        <fieldset className={FIELDSET}>
          <legend className={LEGEND}>{t('preferences.appearance')}</legend>
          <fieldset className={FIELDSET}>
            <legend className={SUB_LEGEND}>{t('preferences.theme')}</legend>
            <div className="flex flex-col">
              {THEMES.map((theme) => (
                <Choice
                  key={theme}
                  type="radio"
                  name="theme"
                  value={theme}
                  checked={draft.theme === theme}
                  onChange={() => change({ theme })}
                >
                  {themeLabel(theme)}
                </Choice>
              ))}
            </div>
          </fieldset>
          <TextSizeField
            id={fieldIds.textSize}
            value={draft.textSize}
            error={shownError('textSize')}
            onChange={(textSize) => change({ textSize })}
            onBlur={() =>
              setTouched((previous) => new Set([...previous, 'textSize']))
            }
          />
        </fieldset>
        <fieldset className={FIELDSET}>
          <legend className={LEGEND}>{t('preferences.recipes')}</legend>
          <fieldset
            aria-describedby={`${id}-diet-hint`}
            className={FIELDSET}
          >
            <legend className={SUB_LEGEND}>{t('preferences.diet')}</legend>
            <p
              id={`${id}-diet-hint`}
              className={HINT}
            >
              {t('preferences.dietHint')}
            </p>
            <div className="flex flex-col">
              {DIETS.map((diet) => (
                <Choice
                  key={diet}
                  type="radio"
                  name="diet"
                  value={diet}
                  checked={draft.diet === diet}
                  onChange={() => change({ diet })}
                >
                  {dietLabel(diet)}
                </Choice>
              ))}
            </div>
          </fieldset>
          <fieldset
            aria-describedby={`${id}-allergens-hint`}
            className={FIELDSET}
          >
            <legend className={SUB_LEGEND}>{t('preferences.allergens')}</legend>
            <p
              id={`${id}-allergens-hint`}
              className={HINT}
            >
              {t('preferences.allergensHint')}
            </p>
            <div className="grid grid-cols-1 gap-x-4 min-[576px]:grid-cols-2">
              {ALLERGEN_FAMILIES.map((family) => (
                <Choice
                  key={family}
                  type="checkbox"
                  name="allergens"
                  value={family}
                  checked={draft.allergens.includes(family)}
                  onChange={() =>
                    change({ allergens: toggled(draft.allergens, family) })
                  }
                >
                  {capitaliseFirst(family)}
                </Choice>
              ))}
            </div>
          </fieldset>
        </fieldset>
        <div>
          <PrimaryButton
            type="submit"
            size="snug"
          >
            {t('preferences.save')}
          </PrimaryButton>
        </div>
        <p
          role="status"
          className="m-0 font-semibold text-text"
        >
          {status}
        </p>
      </form>
    </section>
  )
}
