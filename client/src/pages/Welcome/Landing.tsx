import type { FC, ReactNode } from 'react'
import { useT } from '../../i18n'
import { PrimaryButton } from '../../components/PrimaryButton'
import { Carousel } from './Carousel'

const CARD =
  'flex min-h-[16rem] flex-col gap-3 rounded-card bg-surface p-5 shadow-card'

const Card: FC<{ title: string; children: ReactNode }> = ({
  title,
  children
}) => (
  <div className={CARD}>
    <h2 className="m-0 text-xl font-medium">{title}</h2>
    {children}
  </div>
)

/** Ingredient, suggestion, ticket: the loop in three steps. Text, with the arrows decorative. */
const Picture: FC = () => {
  const t = useT()
  const steps = [
    t('landing.pictureIngredient'),
    t('landing.pictureSuggestion'),
    t('landing.pictureTicket')
  ]
  return (
    <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0 text-sm font-semibold">
      {steps.map((step, i) => (
        <li
          key={step}
          className="flex items-center gap-2"
        >
          {i > 0 && <span aria-hidden="true">→</span>}
          <span className="rounded-pill border border-primary px-3 py-1 text-primary">
            {step}
          </span>
        </li>
      ))}
    </ol>
  )
}

/**
 * The first screen (#211, #238): headline, a three-card carousel (pain, promise and picture,
 * plan and proof) and one button. A hard stop on the first visit.
 */
export const Landing: FC<{ onStart: () => void }> = ({ onStart }) => {
  const t = useT()
  const slides = [
    <Card
      key="pain"
      title={t('landing.painTitle')}
    >
      <p className="m-0 text-text-secondary">{t('landing.pain')}</p>
    </Card>,
    <Card
      key="promise"
      title={t('landing.promiseTitle')}
    >
      <p className="m-0 text-text-secondary">{t('landing.promise')}</p>
      <Picture />
    </Card>,
    <Card
      key="plan"
      title={t('landing.planTitle')}
    >
      <p className="m-0 text-text-secondary">{t('landing.plan')}</p>
      <p className="m-0 font-medium">{t('landing.proof')}</p>
    </Card>
  ]
  return (
    <div className="ingre-page flex flex-col gap-6 py-8">
      <h1 className="m-0 text-3xl font-medium tracking-tight">
        {t('landing.headline')}
      </h1>
      <Carousel
        label={t('landing.carousel')}
        slides={slides}
      />
      <PrimaryButton
        onPress={onStart}
        className="w-full sm:w-auto sm:self-start"
      >
        {t('landing.cta')}
      </PrimaryButton>
    </div>
  )
}
