import { GraphQLError } from 'graphql'

/**
 * Typed application errors. Each maps to a GraphQL error with a stable
 * `extensions.code`, so clients can branch on the code rather than the message.
 */
export class AuthenticationError extends GraphQLError {
  constructor(message = 'Not logged in!') {
    super(message, { extensions: { code: 'UNAUTHENTICATED' } })
    this.name = 'AuthenticationError'
  }
}

export class NotFoundError extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: 'NOT_FOUND' } })
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: 'CONFLICT' } })
    this.name = 'ConflictError'
  }
}

export class PaymentProviderError extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: 'PAYMENT_PROVIDER_ERROR' } })
    this.name = 'PaymentProviderError'
  }
}
