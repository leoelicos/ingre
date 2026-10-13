import React, { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap'

export const EditButton: FC<{
  handleEdit: any
  loggedIn: boolean
}> = ({ handleEdit, loggedIn }) => {
  const navigate = useNavigate()
  return (
    <Button
      onClick={(e) => {
        if (loggedIn) {
          handleEdit(e)
          navigate('/customise')
        } else {
          navigate('/login')
        }
      }}
    >
      Edit
    </Button>
  )
}
