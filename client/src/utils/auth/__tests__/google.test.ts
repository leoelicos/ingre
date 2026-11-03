import { googleAuthUrl, startGoogleAuth } from '../google'

describe('google auth', () => {
  it('builds a desktop authorize URL', () => {
    const url = googleAuthUrl('web', 'client-id', 'https://ingre.app/auth/google')
    expect(url).toContain('accounts.google.com')
    expect(url).toContain('client_id=client-id')
    expect(url).toContain('scope=openid+email+profile')
    expect(url).not.toContain('platform=')
  })

  it('marks native platforms', () => {
    expect(googleAuthUrl('ios', 'id', 'https://app/cb')).toContain('platform=ios')
    expect(googleAuthUrl('android', 'id', 'https://app/cb')).toContain('platform=android')
  })

  it('opens the URL and returns it', () => {
    const opened: string[] = []
    const url = startGoogleAuth({
      platform: 'web',
      clientId: 'id',
      redirect: 'https://app/cb',
      open: (value) => opened.push(value)
    })
    expect(opened).toEqual([url])
    expect(url).toContain('response_type=code')
  })
})
