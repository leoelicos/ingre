import type { FC } from 'react'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js/pure'
import type { Stripe } from '@stripe/stripe-js'
import { useQuery } from '@apollo/client'
import { useT } from '../../i18n'
import type { Translate } from '../../i18n/useT'
import { useUpgrade } from '../../pages/Admin/useUpgrade'
import { GET_TIER } from '../../lib/apollo/graphQL/queries'
import { useAuthContext } from '../../utils/auth/AuthContext'
import type { Tier, TierInfo } from '../../utils/tier/tiers'
import { FEATURES_BY_TIER, TIERS, tierRank } from '../../utils/tier/tiers'
import { useFirstEndToEnd } from '../../utils/tier/upsell'
import NotLoggedIn from '../NotLoggedIn'
import { PrimaryButton } from '../PrimaryButton'
import { PUBLISHABLE_KEY } from '../../utils/stripe/key'
import { CardSubscribe } from './CardSubscribe'

/** #312: loads Stripe.js for the card form; null keeps Stripe's hosted checkout. */
export type LoadCard = (() => Promise<Stripe | null>) | null

export const cardLoader = (key: string | null): LoadCard =>
  key === null ? null : () => loadStripe(key)

const CARD =
  'flex h-full flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-card'

/** The tier below this one, or null for the lowest. */
const tierBelow = ({ id }: TierInfo): Tier | null =>
  TIERS.find((info) => tierRank(info.id) === tierRank(id) - 1)?.id ?? null

const TierCard: FC<{
  info: TierInfo
  current: Tier | null
  starting: boolean
  onChoose: (info: TierInfo) => void
}> = ({ info, current, starting, onChoose }) => {
  const t = useT()
  const name = t(`tiers.names.${info.id}`)
  const below = tierBelow(info)
  return (
    <li>
      <section
        aria-labelledby={`plan-${info.id}`}
        className={CARD}
      >
        <h2
          id={`plan-${info.id}`}
          className="text-xl"
        >
          {name}
        </h2>
        <p>{t('plans.price', { price: info.priceUsd })}</p>
        {below && (
          <p className="text-text-secondary">
            {t('plans.includes', { tier: t(`tiers.names.${below}`) })}
          </p>
        )}
        <p className="text-text-secondary">{t('plans.adds')}</p>
        <ul className="list-inside list-disc">
          {FEATURES_BY_TIER[info.id].map((feature) => (
            <li key={feature}>{t(`tiers.features.${feature}`)}</li>
          ))}
        </ul>
        {current === info.id ? (
          <p role="status">{t('plans.current')}</p>
        ) : (
          <PrimaryButton
            onPress={() => onChoose(info)}
            ariaDisabledOnly={starting}
            className="mt-auto"
          >
            {t('plans.choose', { tier: name })}
          </PrimaryButton>
        )}
      </section>
    </li>
  )
}

const Messages: FC<{
  t: Translate
  cancelled: boolean
  failed: boolean
  starting: boolean
}> = ({ t, cancelled, failed, starting }) => (
  <>
    {cancelled && <p role="status">{t('upgrade.cancelled')}</p>}
    {failed && <p role="alert">{t('upgrade.failed')}</p>}
    {starting && <p role="status">{t('upgrade.starting')}</p>}
  </>
)

const TierChoices: FC<{ loadCard: LoadCard }> = ({ loadCard }) => {
  const t = useT()
  /* #312: with a publishable key, a tier is paid for here, by card; else on Stripe's page */
  const [chosen, setChosen] = useState<TierInfo | null>(null)
  const [stripe, setStripe] = useState<Promise<Stripe | null> | null>(null)
  const choose = (info: TierInfo): void => {
    if (loadCard === null) {
      void startCheckout(info.id)
      return
    }
    setStripe((loaded) => loaded ?? loadCard())
    setChosen(info)
  }
  const { startCheckout, cancelled, checkoutFailed, checkoutStarting } =
    useUpgrade()
  const { data } = useQuery(GET_TIER)
  const current = data?.getUser.tier ?? null
  return (
    <div className="flex flex-col gap-4">
      <p>{t('plans.intro')}</p>
      <p>{t('plans.testMode')}</p>
      <Messages
        t={t}
        cancelled={cancelled}
        failed={checkoutFailed}
        starting={checkoutStarting}
      />
      <ul className="grid gap-4 md:grid-cols-3">
        {TIERS.map((info) => (
          <TierCard
            key={info.id}
            info={info}
            current={current}
            starting={checkoutStarting}
            onChoose={choose}
          />
        ))}
      </ul>
      {chosen !== null && stripe !== null && (
        <CardSubscribe
          key={chosen.id}
          info={chosen}
          name={t(`tiers.names.${chosen.id}`)}
          stripe={stripe}
        />
      )}
    </div>
  )
}

const PlansBody: FC<{
  firstEndToEnd: boolean
  loggedIn: boolean
  loadCard: LoadCard
}> = ({ firstEndToEnd, loggedIn, loadCard }) => {
  const t = useT()
  if (!firstEndToEnd) return <p>{t('plans.notYet')}</p>
  return loggedIn ? <TierChoices loadCard={loadCard} /> : <NotLoggedIn />
}

/**
 * The tiers (#208), reached from the account menu once the first end-to-end is done.
 * Before that it says when Plans open, and shows no prices or checkout.
 */
export const Plans: FC<{ loadCard?: LoadCard }> = ({
  loadCard = cardLoader(PUBLISHABLE_KEY)
}) => {
  const t = useT()
  const firstEndToEnd = useFirstEndToEnd()
  const [auth] = useAuthContext()
  return (
    <div className="mx-auto flex w-full max-w-layout flex-col gap-4 px-gutter py-4">
      <h1 className="text-2xl">{t('plans.title')}</h1>
      <PlansBody
        firstEndToEnd={firstEndToEnd}
        loggedIn={auth.loggedIn}
        loadCard={loadCard}
      />
    </div>
  )
}
