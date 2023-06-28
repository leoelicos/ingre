/* react */
import React, { FC } from 'react'
import { Link } from 'react-router-dom'

/* components */
import { Col, Row } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import Logo from './Logo.tsx'

/* types */
interface ToggleMenuProps {
  collapsed: boolean
  onClick: () => void
}

const ToggleMenu: FC<ToggleMenuProps> = ({ collapsed, onClick }) => (
  <Col className="col-logo">
    <Row
      className="header-row-row-col1-row"
      align="middle"
      style={{ marginTop: '-1px', paddingBottom: '2px' }}
    >
      {collapsed ? (
        <MenuUnfoldOutlined
          onClick={onClick}
          style={{
            color: 'var(--ingre-dark-brown)',
            fontSize: '1.2rem',
            margin: '0 1.2rem'
          }}
        />
      ) : (
        <MenuFoldOutlined
          onClick={onClick}
          style={{
            color: 'var(--ingre-dark-brown)',
            fontSize: '1.2rem',
            margin: '0 1.2rem'
          }}
        />
      )}

      <Link to="/">
        <Logo />
      </Link>
    </Row>
  </Col>
)

export default ToggleMenu
