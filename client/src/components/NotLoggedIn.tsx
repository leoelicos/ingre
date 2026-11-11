import { translate } from '../i18n'
import type { FC } from 'react'
import { Link } from 'react-router-dom'

const NotLoggedIn: FC = () => {
  return (
    <div>
      <div>{translate('notLoggedIn.message')}</div>
      <Link
        to="/login"
        className="focus-visible:focus-ring"
      >
        {translate('notLoggedIn.logIn')}
      </Link>
    </div>
  )
}

export default NotLoggedIn
