// jwt-decode to parse
import decode from 'jwt-decode'

// Singleton class for authentication
export default new (class AuthService {
  getProfile = () => {
    const token = this.getToken()
    return token ? decode(this.getToken()) : null
  }

  getToken = () => localStorage.getItem('id_token')

  isTokenExpired = (token) => {
    const decoded = decode(token)
    const { exp: timeExpiry } = decoded
    const timeNow = Date.now() / 1000
    return timeExpiry < timeNow
  }

  loggedIn = () => {
    const token = this.getToken()
    return !!token && !this.isTokenExpired(token)
  }

  login(idToken) {
    localStorage.setItem('id_token', idToken)
  }

  logout() {
    localStorage.removeItem('id_token')
  }
})()
