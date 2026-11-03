/** Exchange a Google identity for the existing JWT session. */

export type GoogleIdentity = {
  email: string
  sub: string
  given_name?: string
}

export type SessionUser = {
  email: string
  firstName: string
  _id: string
}

export function userFromGoogle(identity: GoogleIdentity, existing: SessionUser | null): SessionUser {
  if (existing) return existing
  return {
    email: identity.email,
    firstName: identity.given_name ?? identity.email.split('@')[0] ?? 'Google',
    _id: `google:${identity.sub}`
  }
}
