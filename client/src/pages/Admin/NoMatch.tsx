import { useT } from '../../i18n'
import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { changeTitle } from '../../utils/changeTitle'

export const NoMatch: FC = () => {
  const t = useT()
  const navigate = useNavigate()
  changeTitle('ingré')

  return (
    <div>
      <p>{t('notFound.message')}</p>
      {/* one control, not a button inside a link (#106) */}
      <button
        type="button"
        className="focus-visible:focus-ring"
        onClick={() => navigate('/')}
      >
        {t('notFound.goHome')}
      </button>
    </div>
  )
}
