/* Decode JWT token */

import decode from 'jwt-decode'

type profileType = {
  data: { firstName: string; email: string; _id: string; pro: string }
  exp: number
}

// Singleton class for authentication
class AuthService {
  getProfile(): profileType | null {
    const token = this.getToken()
    const profile = token ? decode<profileType>(this.getToken()) : null
    return profile
  }

  getToken(): string {
    return localStorage.getItem('id_token') || ''
  }

  isTokenExpired(token: string): boolean {
    const decoded = decode<profileType>(token)
    const { exp: timeExpiry } = decoded
    const timeNow = Date.now() / 1000
    return timeExpiry < timeNow
  }

  loggedIn(): boolean {
    const token = this.getToken()
    return !!token && !this.isTokenExpired(token)
  }

  login(idToken: string): void {
    localStorage.setItem('id_token', idToken)
  }

  logout(): void {
    localStorage.removeItem('id_token')
  }
}

const Auth = new AuthService()

export default Auth
