import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap'

export const EditButton: FC<{
  handleEdit: () => void
  loggedIn: boolean
}> = ({ handleEdit, loggedIn }) => {
  const navigate = useNavigate()
  return (
    <Button
      onClick={() => {
        if (loggedIn) {
          handleEdit()
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
