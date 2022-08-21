import decode from 'jwt-decode';
export default new (class AuthService {
  getProfile = () => decode(this.getToken());
  getToken = () => localStorage.getItem('id_token');
  isTokenExpired = (token) => decode(token) < Date.now() / 1000;
  loggedIn = () => {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  };
  login(idToken) {
    localStorage.setItem('id_token', idToken);
    window.location.assign('/');
  }
  logout() {
    localStorage.removeItem('id_token');
    window.location.assign('/');
  }
})();
