/* react */
import React, { FC } from 'react'
import { Link } from 'react-router-dom'

/* components */
import { Col, Row, Steps } from 'antd'
import {
  IngreIconIngredients,
  IngreIconRecipe,
  IngreIconTapOff
} from '../../../../lib/icon/Icon.tsx'

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
          <Steps.Step
            icon={
              <Link to="/">
                <IngreIconRecipe />
              </Link>
            }
          />
          <Steps.Step
            icon={
              <Link to="/ingredients">
                <IngreIconIngredients />
              </Link>
            }
          />
          <Steps.Step
            icon={
              <Link to="/tapoff">
                <IngreIconTapOff />
              </Link>
            }
          />
        </Steps>
      </Row>
    </Col>
  )
}
export default StepSmall
