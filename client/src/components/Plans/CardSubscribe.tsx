/*
 * #312: pay for a tier with a card, in place. Stripe.js Elements draws the card field (the
 * number never touches ingré), `stripe.createToken(cardElement)` turns it into a token, and
 * only the token's id goes to the server, which subscribes with it.
 *
 * createToken is Stripe's legacy Tokens API (PaymentMethods and SetupIntents replace it);
 * it is used here on purpose, as asked for in #312.
 */
import type { FC, FormEvent } from 'react'
import { useState } from 'react'
import { ApolloError, useMutation } from '@apollo/client'
import {
  CardElement,
  Elements,
  useElements,
  useStripe
} from '@stripe/react-stripe-js'
import type { Stripe } from '@stripe/stripe-js'
import { useT } from '../../i18n'
import { SUBSCRIBE } from '../../lib/apollo/graphQL/mutations'
import { GET_TIER } from '../../lib/apollo/graphQL/queries'
import type { TierInfo } from '../../utils/tier/tiers'
import { PrimaryButton } from '../PrimaryButton'

type Outcome =
  | { readonly kind: 'idle' }
  | { readonly kind: 'paying' }
  | { readonly kind: 'subscribed' }
  | { readonly kind: 'incomplete' }
  | { readonly kind: 'declined'; readonly message: string }
  | { readonly kind: 'failed' }

/** A decline's message (the card form's own, or the server's PAYMENT_DECLINED); else null. */
export const declineMessage = (error: unknown): string | null => {
  if (!(error instanceof ApolloError)) return null
  const declined = error.graphQLErrors.find(
    ({ extensions }) => extensions?.['code'] === 'PAYMENT_DECLINED'
  )
  return declined?.message ?? null
}

const Result: FC<{ outcome: Outcome; tier: string }> = ({ outcome, tier }) => {
  const t = useT()
  switch (outcome.kind) {
    case 'subscribed':
      return <p role="status">{t('plans.card.subscribed', { tier })}</p>
    case 'incomplete':
      return <p role="alert">{t('plans.card.incomplete')}</p>
    case 'declined':
      return (
        <p role="alert">
          {t('plans.card.declined', { message: outcome.message })}
        </p>
      )
    case 'failed':
      return <p role="alert">{t('plans.card.failed')}</p>
    case 'paying':
      return <p role="status">{t('plans.card.paying')}</p>
    case 'idle':
      return null
  }
}

const CardForm: FC<{ info: TierInfo; name: string }> = ({ info, name }) => {
  const t = useT()
  const stripe = useStripe()
  const elements = useElements()
  const [outcome, setOutcome] = useState<Outcome>({ kind: 'idle' })
  const [subscribe] = useMutation(SUBSCRIBE, {
    refetchQueries: [{ query: GET_TIER }]
  })

  const pay = async (): Promise<Outcome> => {
    const card = elements?.getElement(CardElement) ?? null
    if (stripe === null || card === null) return { kind: 'failed' }
    const { token, error } = await stripe.createToken(card)
    if (token === undefined) {
      return { kind: 'declined', message: error.message ?? '' }
    }
    const result = await subscribe({
      variables: { tier: info.id, token: token.id }
    })
    return result.data?.subscribe.active === true
      ? { kind: 'subscribed' }
      : { kind: 'incomplete' }
  }

  const onSubmit = (event: FormEvent): void => {
    event.preventDefault()
    if (outcome.kind === 'paying') return
    setOutcome({ kind: 'paying' })
    pay()
      .catch((error: unknown): Outcome => {
        const message = declineMessage(error)
        return message === null
          ? { kind: 'failed' }
          : { kind: 'declined', message }
      })
      .then(setOutcome)
  }

  return (
    <form
      aria-labelledby="pay-heading"
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4"
    >
      <h2
        id="pay-heading"
        className="text-xl"
      >
        {t('plans.card.heading', { tier: name })}
      </h2>
      <p className="text-text-secondary">{t('plans.card.testCards')}</p>
      <p
        id="card-label"
        className="font-medium"
      >
        {t('plans.card.label')}
      </p>
      <div
        role="group"
        aria-labelledby="card-label"
        className="rounded-control border border-border bg-bg p-3"
      >
        <CardElement />
      </div>
      <Result
        outcome={outcome}
        tier={name}
      />
      <PrimaryButton
        type="submit"
        ariaDisabledOnly={outcome.kind === 'paying'}
      >
        {t('plans.card.pay', { price: info.priceUsd })}
      </PrimaryButton>
    </form>
  )
}

/** The card form for one tier, inside Stripe Elements (Stripe.js loads when this mounts). */
export const CardSubscribe: FC<{
  info: TierInfo
  name: string
  stripe: Promise<Stripe | null>
}> = ({ info, name, stripe }) => (
  <Elements stripe={stripe}>
    <CardForm
      info={info}
      name={name}
    />
  </Elements>
)
