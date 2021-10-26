import React from 'react'
import { Button } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { Role } from '../../models/api/Role'
import { RootState } from '../../store'

interface ScheduleEmptyProps {
  organizationId: string
  manageMessage: string
  manageLink: string
  standardMessage: string
}

const ScheduleEmpty = ({
  organizationId,
  manageMessage,
  manageLink,
  standardMessage,
}: ScheduleEmptyProps) => {
  const history = useHistory()

  const isAdmin = useSelector<RootState, boolean>((state) =>
    state.memberships.entity[organizationId].roles.includes(Role.ADMIN)
  )

  return (
    <>
      {isAdmin ? (
        <div>
          <p>{manageMessage}</p>
          <p>
            <Button onClick={() => history.push(manageLink)}>Manage</Button>
          </p>
        </div>
      ) : (
        <div>
          <p>{standardMessage}</p>
        </div>
      )}
    </>
  )
}

export default ScheduleEmpty
