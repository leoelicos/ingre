
## Google OAuth (#285)

Desktop opens the Google authorize URL. iOS and Android pass `platform=ios|android` so the shell can use Capacitor Google Auth or a system browser session. The server maps the Google identity onto an existing user or creates one, then issues the same JWT.
