import type { FC } from 'react'
import { Link as ReactRouterDomLink } from 'react-router-dom'

export const Link: FC<{
  to: string
  children: React.ReactNode
  className?: string
}> = ({ to, children, className }) => {
  return (
    <ReactRouterDomLink
      to={to}
      children={children}
      {...(className === undefined ? {} : { className })}
    />
  )
}
