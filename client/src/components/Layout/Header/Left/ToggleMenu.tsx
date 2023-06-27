/* react */
import React, { FC } from 'react'
import { Link } from 'react-router-dom'

/* components */
import { Col, Row, Typography } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

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
        <Typography.Title style={{ marginBottom: 0 }}>
          <FontAwesomeIcon
            className="ingre-logo"
            icon={'fa-solid fa-egg' as IconProp}
            style={{
              marginRight: '0.3rem',
              color: 'var(--ingre-eggshell)',
              fontSize: '1.8rem',
              paddingBottom: '2px'
            }}
          />
          <span
            style={{
              color: 'var(--ingre-dark-brown)',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '36px',
              letterSpacing: -1,
              fontWeight: '800'
            }}
          >
            ingré
          </span>
        </Typography.Title>
      </Link>
    </Row>
  </Col>
)

export default ToggleMenu
