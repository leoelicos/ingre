import { signedInUser, userOfToken } from '../account'
import { logIn, testToken } from '../../../test/providers'

/* Paddle + RevenueCat: the signed-in user, for Paddle's custom data. */

const tokenWith = (data: unknown): string =>
  `e30.${Buffer.from(JSON.stringify({ exp: 1, data })).toString(
    'base64url'
  )}.sig`

describe('userOfToken', () => {
  afterEach(() => localStorage.clear())

  it('reads the id and email', () => {
    expect(userOfToken(testToken(false))).toEqual({
      id: 'u1',
      email: 'ada@example.com'
    })
    expect(userOfToken(tokenWith({ _id: 'u2' }))).toEqual({
      id: 'u2',
      email: null
    })
  })

  it('is null without a usable token', () => {
    expect(userOfToken(null)).toBeNull()
    expect(userOfToken('garbage')).toBeNull()
    expect(userOfToken(tokenWith(null))).toBeNull()
    expect(userOfToken(tokenWith({ _id: 7 }))).toBeNull()
    expect(
      userOfToken(`e30.${Buffer.from('7').toString('base64url')}.sig`)
    ).toBeNull()
  })

  it('reads the stored token', () => {
    expect(signedInUser()).toBeNull()
    logIn(false)
    expect(signedInUser()?.id).toBe('u1')
  })
})
