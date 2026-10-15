import type { FC, MouseEvent } from 'react'
import { Link as ReactRouterDomLink } from 'react-router-dom'

export const Link: FC<{
  to: string
  children: React.ReactNode
  className?: string
  state?: unknown
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
}> = ({ to, children, className, state, onClick }) => {
  return (
    <ReactRouterDomLink
      to={to}
      state={state}
      children={children}
      {...(className === undefined ? {} : { className })}
      {...(onClick === undefined ? {} : { onClick })}
    />
  )
}
