import React, { FC } from 'react'
import { MenuUnfoldOutlined } from '@ant-design/icons'
const ExpandedMenuIcon: FC<{ onClick: any }> = ({ onClick }) => {
  return (
    <MenuUnfoldOutlined
      onClick={onClick}
      style={{
        color: 'var(--ingre-dark-brown)',
        fontSize: '1.2rem',
        margin: '0 1.2rem'
      }}
    />
  )
}
export default ExpandedMenuIcon
