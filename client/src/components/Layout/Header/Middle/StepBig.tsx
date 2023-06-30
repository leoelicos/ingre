/* react */
import React, { FC } from 'react'
import { Link } from 'react-router-dom'

/* components */
import { Col, Row, Steps } from 'antd'
import {
  IngreIconIngredients,
  IngreIconRecipe,
  IngreIconTapOff
} from '../../../Icons/Icon.tsx'

const StepBig: FC<{ pathname: string }> = ({ pathname }) => {
  const getStep =
    pathname === '/tapoff' ? 2 : pathname === '/ingredients' ? 1 : 0

  return (
    <Col
      className="col-steps-lg"
      span={0}
      md={11}
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
            title={<Link to="/">Recipes</Link>}
            icon={
              <Link to="/">
                <IngreIconRecipe />
              </Link>
            }
          />
          <Steps.Step
            title={<Link to="/ingredients">Ingredients</Link>}
            icon={
              <Link to="/ingredients">
                <IngreIconIngredients />
              </Link>
            }
          />
          <Steps.Step
            title={<Link to="/tapoff">Tap Off</Link>}
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
export default StepBig
