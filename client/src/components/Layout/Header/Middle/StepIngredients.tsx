import React, { FC } from 'react'
import { Steps } from 'antd'
import { Link } from 'react-router-dom'
import { IngreIconIngredients } from '../../../../lib/icon/Icon'

const StepIngredients: FC = () => {
  return (
    <Steps.Step
      icon={
        <Link to="/ingredients">
          <IngreIconIngredients />
        </Link>
      }
    />
  )
}
export default StepIngredients
