import { userFromGoogle } from './google'

describe('userFromGoogle', () => {
  it('returns the existing user when one matches', () => {
    const existing = { email: 'a@b.c', firstName: 'Ada', _id: '1' }
    expect(userFromGoogle({ email: 'a@b.c', sub: 'g1' }, existing)).toEqual(
      existing
    )
  })

  it('creates a user from the Google profile when none exists', () => {
    expect(
      userFromGoogle({ email: 'new@b.c', sub: 'g2', given_name: 'Grace' }, null)
    ).toEqual({
      email: 'new@b.c',
      firstName: 'Grace',
      _id: 'google:g2'
    })
  })
})
