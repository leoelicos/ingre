import { Steps } from 'antd'
import React, { FC } from 'react'
import { Link } from 'react-router-dom'
import { IngreIconTapOff } from '../../../../../lib/icon/Icon'

const StepTapOff: FC = () => {
  return (
    <Steps.Step
      title={<Link to="/tapoff">Tap Off</Link>}
      icon={
        <Link to="/tapoff">
          <IngreIconTapOff />
        </Link>
      }
    />
  )
}
export default StepTapOff
