import React, { FC } from 'react'
import { Link as ReactRouterDomLink } from 'react-router-dom'

export const Link: FC<{ to: string; children: React.ReactNode }> = ({
  to,
  children
}) => {
  return (
    <ReactRouterDomLink
      to={to}
      children={children}
    />
  )
}
