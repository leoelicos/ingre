import type { FC } from 'react'
import { Link as ReactRouterDomLink } from 'react-router-dom'

export const Link: FC<{
  to: string
  children: React.ReactNode
  className?: string
  state?: unknown
}> = ({ to, children, className, state }) => {
  return (
    <ReactRouterDomLink
      to={to}
      state={state}
      children={children}
      {...(className === undefined ? {} : { className })}
    />
  )
}
