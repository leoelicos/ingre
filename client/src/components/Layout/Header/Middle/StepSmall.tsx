/* react */
import React, { FC } from 'react'

/* components */
import { Col, Row } from 'antd'
import Steps from './Steps/Steps.tsx'

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
        <Steps step={getStep} />
      </Row>
    </Col>
  )
}
export default StepSmall
