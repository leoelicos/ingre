/* What the Preferences form checks before it saves. Messages say what to do, not what went wrong. */
import { translate } from '../../i18n'
import { MAX_TEXT_SIZE, MIN_TEXT_SIZE } from './appearance'

/** The fields that can be wrong, in the order the form shows them. */
export type CheckedField = 'textSize'
export const CHECKED_FIELDS: readonly CheckedField[] = ['textSize']

export type FieldErrors = Partial<Record<CheckedField, string>>

/** A typed text size, forgiving spaces and a trailing "%": " 125 % " is 125. */
export const readTextSize = (raw: string): number | null => {
  const text = raw.trim().replace(/\s*%$/, '')
  return /^\d+$/.test(text) ? Number(text) : null
}

export const textSizeError = (raw: string): string | null => {
  if (raw.trim() === '') return translate('preferences.textSize.required')
  const size = readTextSize(raw)
  if (size === null) return translate('preferences.textSize.whole')
  return size < MIN_TEXT_SIZE || size > MAX_TEXT_SIZE
    ? translate('preferences.textSize.range', {
        min: MIN_TEXT_SIZE,
        max: MAX_TEXT_SIZE
      })
    : null
}

/** Every field's error, for the summary on submit. */
export const formErrors = (values: { textSize: string }): FieldErrors => {
  const textSize = textSizeError(values.textSize)
  return textSize === null ? {} : { textSize }
}

/** The errors in form order, for the summary. */
export const errorList = (
  errors: FieldErrors
): { field: CheckedField; message: string }[] =>
  CHECKED_FIELDS.flatMap((field) => {
    const message = errors[field]
    return message === undefined ? [] : [{ field, message }]
  })
