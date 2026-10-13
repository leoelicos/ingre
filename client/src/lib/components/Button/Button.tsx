import type { FC } from 'react'

export const Button: FC<{ onClick: () => void; children: React.ReactNode }> = ({
  onClick,
  children
}) => {
  return (
    <button
      onClick={onClick}
      children={children}
    />
  )
}
