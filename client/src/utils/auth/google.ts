/** Google OAuth start path. Desktop uses a redirect; native apps pass their platform. */

export type GooglePlatform = 'web' | 'ios' | 'android'

export function googleAuthUrl(
  platform: GooglePlatform,
  clientId: string,
  redirect: string
): string {
  const base = 'https://accounts.google.com/o/oauth2/v2/auth'
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirect,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account'
  })
  if (platform !== 'web') params.set('platform', platform)
  return `${base}?${params.toString()}`
}

export function startGoogleAuth(input: {
  platform: GooglePlatform
  clientId: string
  redirect: string
  open: (url: string) => void
}): string {
  const url = googleAuthUrl(input.platform, input.clientId, input.redirect)
  input.open(url)
  return url
}
