import { useState } from 'react'
import type { FC } from 'react'
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Label,
  ProgressBar,
  Radio,
  RadioGroup
} from 'react-aria-components'
import { useT } from '../../i18n'
import type { Translate } from '../../i18n/useT'
import { PrimaryButton } from '../../components/PrimaryButton'
import { capitaliseFirst } from '../../utils/capitaliseFirst'
import { GUIDANCE_MODES } from '../../utils/guidance/guidance'
import { useExplore } from '../../utils/explore/ExploreContext'
import type { TmdAnswers } from '../../utils/tmd/tmd'
import {
  AVOID_OPTIONS,
  DIETS,
  TMD_STEPS,
  pick,
  useTmd
} from '../../utils/tmd/tmd'

const OPTION =
  'flex min-h-[44px] cursor-pointer items-center gap-3 rounded-control border border-border bg-surface px-3 py-2 data-[selected]:border-primary data-[selected]:bg-chip-active data-[focus-visible]:focus-ring'

/** What each step asks and why, as written for the screen. */
const stepText = (t: Translate) => ({
  guidance: {
    question: t('tmd.guidanceQuestion'),
    why: t('tmd.guidanceWhy')
  },
  diet: { question: t('tmd.dietQuestion'), why: t('tmd.dietWhy') },
  avoid: { question: t('tmd.avoidQuestion'), why: t('tmd.avoidWhy') }
})

const GuidanceStep: FC<{
  value: TmdAnswers['guidance']
  onChange: (value: TmdAnswers['guidance']) => void
  question: string
}> = ({ value, onChange, question }) => {
  const t = useT()
  const names = {
    'self-directed': t('guidance.self-directed'),
    guided: t('guidance.guided'),
    assisted: t('guidance.assisted'),
    'hand-held': t('guidance.hand-held')
  }
  return (
    <RadioGroup
      value={value}
      onChange={(next) => onChange(pick(GUIDANCE_MODES, next, value))}
      className="flex flex-col gap-2"
    >
      <Label className="text-lg font-medium">{question}</Label>
      {GUIDANCE_MODES.map((mode) => (
        <Radio
          key={mode}
          value={mode}
          className={OPTION}
        >
          {names[mode]}
        </Radio>
      ))}
    </RadioGroup>
  )
}

const DietStep: FC<{
  value: TmdAnswers['diet']
  onChange: (value: TmdAnswers['diet']) => void
  question: string
}> = ({ value, onChange, question }) => {
  const t = useT()
  const names = {
    none: t('tmd.dietNone'),
    pescatarian: t('tmd.dietPescatarian'),
    vegetarian: t('tmd.dietVegetarian'),
    vegan: t('tmd.dietVegan')
  }
  return (
    <RadioGroup
      value={value}
      onChange={(next) => onChange(pick(DIETS, next, value))}
      className="flex flex-col gap-2"
    >
      <Label className="text-lg font-medium">{question}</Label>
      {DIETS.map((diet) => (
        <Radio
          key={diet}
          value={diet}
          className={OPTION}
        >
          {names[diet]}
        </Radio>
      ))}
    </RadioGroup>
  )
}

const AvoidStep: FC<{
  value: readonly string[]
  onChange: (value: readonly string[]) => void
  question: string
}> = ({ value, onChange, question }) => (
  <CheckboxGroup
    value={[...value]}
    onChange={(next) => onChange(AVOID_OPTIONS.filter((o) => next.includes(o)))}
    className="flex flex-col gap-2"
  >
    <Label className="text-lg font-medium">{question}</Label>
    <div className="grid grid-cols-2 gap-2">
      {AVOID_OPTIONS.map((option) => (
        <Checkbox
          key={option}
          value={option}
          className={OPTION}
        >
          {capitaliseFirst(option)}
        </Checkbox>
      ))}
    </div>
  </CheckboxGroup>
)

/**
 * The three TMD questions (#211): "Step X of 3", why we ask, Back and Next, and Skip at every
 * step. Finishing saves the answers and sets the dial; skipping changes nothing, so a first run
 * ends on Assisted. `onDone` runs either way.
 */
export const Tmd: FC<{ onDone: () => void }> = ({ onDone }) => {
  const t = useT()
  const { answers, save } = useTmd()
  const { setGuidance } = useExplore()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<TmdAnswers>(answers)
  const last = step === TMD_STEPS.length - 1
  const text = stepText(t)
  const current = TMD_STEPS.filter((_, i) => i === step)
  const finish = (): void => {
    save(draft)
    setGuidance(draft.guidance)
    onDone()
  }
  return (
    <div className="ingre-page mx-auto flex w-full max-w-xl flex-col gap-5 py-8">
      <ProgressBar
        value={step + 1}
        minValue={1}
        maxValue={TMD_STEPS.length}
        valueLabel={t('tmd.step', { step: step + 1, total: TMD_STEPS.length })}
        className="flex flex-col gap-2"
      >
        {({ percentage, valueText }) => (
          <>
            <div className="flex items-baseline justify-between">
              <Label className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
                {t('tmd.title')}
              </Label>
              <span className="text-sm text-text-secondary">{valueText}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-pill bg-border">
              <div
                className="h-full rounded-pill bg-primary"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </>
        )}
      </ProgressBar>
      {current.map((name) => (
        <section
          key={name}
          className="flex flex-col gap-4"
        >
          {name === 'guidance' && (
            <GuidanceStep
              value={draft.guidance}
              onChange={(guidance) => setDraft({ ...draft, guidance })}
              question={text.guidance.question}
            />
          )}
          {name === 'diet' && (
            <DietStep
              value={draft.diet}
              onChange={(diet) => setDraft({ ...draft, diet })}
              question={text.diet.question}
            />
          )}
          {name === 'avoid' && (
            <AvoidStep
              value={draft.avoid}
              onChange={(avoid) => setDraft({ ...draft, avoid })}
              question={text.avoid.question}
            />
          )}
          <p className="m-0 text-sm text-text-secondary">{text[name].why}</p>
        </section>
      ))}
      <p className="m-0 text-sm text-text-secondary">{t('tmd.changeLater')}</p>
      <div className="flex flex-wrap items-center gap-2">
        {step > 0 && (
          <Button
            onPress={() => setStep(step - 1)}
            className="min-h-[48px] rounded-control border border-border bg-surface px-4 focus-visible:focus-ring"
          >
            {t('tmd.back')}
          </Button>
        )}
        <PrimaryButton onPress={last ? finish : () => setStep(step + 1)}>
          {last ? t('tmd.finish') : t('tmd.next')}
        </PrimaryButton>
        <Button
          onPress={onDone}
          className="min-h-[48px] rounded-control px-4 text-primary underline focus-visible:focus-ring"
        >
          {t('tmd.skip')}
        </Button>
      </div>
    </div>
  )
}
