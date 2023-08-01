/* react */
import React, { FC } from 'react'

/* components */
import { Col, Row } from 'antd'
import Steps from './Steps/Steps.tsx'

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
        <Steps step={getStep} />
      </Row>
    </Col>
  )
}
export default StepBig
