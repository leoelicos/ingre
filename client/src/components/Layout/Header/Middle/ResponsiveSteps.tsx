import { Col, Row } from 'antd'
import React, { FC } from 'react'
import Steps from './Steps/Steps.tsx'

const ResponsiveSteps: FC<{ step: number }> = ({ step }) => {
  return (
    <>
      {/* one of these is alternately hidden, depending on media query */}
      <Col
        className="col-steps-lg"
        span={0}
        md={11}
      >
        <Row
          className="header-row-row-col2-row"
          align="middle"
        >
          <Steps step={step} />
        </Row>
      </Col>
      {/* one of these is alternately hidden, depending on media query */}
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
          <Steps step={step} />
        </Row>
      </Col>
    </>
  )
}
export default ResponsiveSteps
