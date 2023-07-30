import React, { FC } from 'react'
import { MenuFoldOutlined } from '@ant-design/icons'

const MenuIconCollapsed: FC<{ onClick: any }> = ({ onClick }) => {
  return (
    <MenuFoldOutlined
      onClick={onClick}
      style={{
        color: 'var(--ingre-dark-brown)',
        fontSize: '1.2rem',
        margin: '0 1.2rem'
      }}
    />
  )
}
export default MenuIconCollapsed
