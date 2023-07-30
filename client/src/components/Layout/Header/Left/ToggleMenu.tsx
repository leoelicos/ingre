/* react */
import React, { FC } from 'react'
import { Link } from 'react-router-dom'

/* components */
import { Col, Row } from 'antd'
import Logo from './Logo.tsx'
import ExpandedMenuIcon from './MenuIconExpanded.tsx'
import MenuIconCollapsed from './MenuIconCollapsed.tsx'

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
        <ExpandedMenuIcon onClick={onClick} />
      ) : (
        <MenuIconCollapsed onClick={onClick} />
      )}

      <Link to="/">
        <Logo />
      </Link>
    </Row>
  </Col>
)

export default ToggleMenu
