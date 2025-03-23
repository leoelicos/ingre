import React, { FC } from 'react'
import { Link } from 'react-router-dom'
import { changeTitle } from 'utils/changeTitle'

export const NoMatch: FC = () => {
  changeTitle('ingré')

  return (
    <div>
      <p>Page Not Found</p>
      <Link to="/">
        <button>Go home</button>
      </Link>
    </div>
  )
}
