import React, { FC } from 'react'
import { Steps } from 'antd'
import { Link } from 'react-router-dom'
import { IngreIconRecipe } from '../../../../lib/icon/Icon'

const StepRecipes: FC = () => {
  return (
    <Steps.Step
      title={<Link to="/">Recipes</Link>}
      icon={
        <Link to="/">
          <IngreIconRecipe />
        </Link>
      }
    />
  )
}
export default StepRecipes
