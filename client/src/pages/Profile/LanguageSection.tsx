/*
 * Language (ja): English or 日本語. Each option is written in its own language and marked
 * with lang, so a screen reader speaks it with the right voice. Radios: arrow keys move and
 * pick, and the app switches at once.
 */
import type { FC } from 'react'
import { Radio, RadioGroup, Text } from 'react-aria-components'
import type { Locale } from '../../i18n'
import { LOCALES, useLocale, useT } from '../../i18n'

const CARD = 'flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card'
const HEADING = 'm-0 text-xl font-semibold text-text'
const OPTION =
  'flex min-h-[44px] cursor-pointer items-center gap-3 rounded-control border border-border bg-surface px-3 py-2 text-text data-[selected]:border-primary data-[selected]:bg-chip-active data-[focus-visible]:focus-ring'

/** The locale for a picked radio value; anything else keeps the current one. */
export const pickLocale = (value: string, current: Locale): Locale =>
  LOCALES.find(({ code }) => code === value)?.code ?? current

export const LanguageSection: FC = () => {
  const t = useT()
  const [locale, setLocale] = useLocale()
  return (
    <section
      aria-labelledby="profile-language"
      className={CARD}
    >
      <h2
        id="profile-language"
        className={HEADING}
      >
        {t('language.title')}
      </h2>
      <RadioGroup
        aria-labelledby="profile-language"
        value={locale}
        onChange={(value) => setLocale(pickLocale(value, locale))}
        className="flex flex-col gap-2"
      >
        <Text
          slot="description"
          className="m-0 text-text"
        >
          {t('language.hint')}
        </Text>
        {LOCALES.map(({ code, name }) => (
          <Radio
            key={code}
            value={code}
            className={OPTION}
          >
            <span lang={code}>{name}</span>
          </Radio>
        ))}
      </RadioGroup>
    </section>
  )
}
