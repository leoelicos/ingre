import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageMain } from '../../components/SkipLink'
import { Tmd } from './Tmd'

/** The same three questions again (#211: changeable later), from the account menu. */
export const Setup: FC = () => {
  const navigate = useNavigate()
  return (
    <PageMain>
      <Tmd onDone={() => navigate('/')} />
    </PageMain>
  )
}
