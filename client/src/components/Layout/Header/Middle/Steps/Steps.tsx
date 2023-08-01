import React, { FC } from 'react'
import { Steps as AntSteps } from 'antd'
import StepRecipes from './StepRecipes.tsx'
import StepIngredients from './StepIngredients.tsx'
import StepTapOff from './StepTapOff.tsx'
const Steps: FC<{ step: number }> = ({ step }) => {
  return (
    <AntSteps
      className="header-row-row-col2-row-steps"
      size="small"
      current={step}
      responsive={false}
    >
      <StepRecipes />
      <StepIngredients />
      <StepTapOff />
    </AntSteps>
  )
}
export default Steps
