/* react */
import React, { FC } from 'react'

/* components */
import { Col, Row, Steps } from 'antd'
import StepTapOff from './StepTapOff.tsx'
import StepIngredients from './StepIngredients.tsx'
import StepRecipes from './StepRecipes.tsx'

const StepSmall: FC<{ pathname: string }> = ({ pathname }) => {
  const getStep =
    pathname === '/tapoff' ? 2 : pathname === '/ingredients' ? 1 : 0

  return (
    <Col
      className="col-steps-sm"
      span={0}
      sm={7}
      md={0}
    >
      <Row
        className="header-row-row-col2-row"
        align="middle"
      >
        <Steps
          className="header-row-row-col2-row-steps"
          size="small"
          current={getStep}
          responsive={false}
        >
          <StepRecipes />
          <StepIngredients />
          <StepTapOff />
        </Steps>
      </Row>
    </Col>
  )
}
export default StepSmall
