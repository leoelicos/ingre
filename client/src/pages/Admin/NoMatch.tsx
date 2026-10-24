import { useT } from '../../i18n'
import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { changeTitle } from '../../utils/changeTitle'

export const NoMatch: FC = () => {
  const t = useT()
  changeTitle('ingré')

  return (
    <div>
      <p>{t('notFound.message')}</p>
      <Link to="/">
        <button>{t('notFound.goHome')}</button>
      </Link>
    </div>
  )
}
