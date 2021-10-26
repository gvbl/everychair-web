import React from 'react'
import { ListGroup } from 'react-bootstrap'
import Organization from '../../../models/api/Organization'
import ReserveOrganizationListItem from './ReserveOrganizationListItem'
import './ReserveList.css'
import Desk from '../../../models/api/Desk'

interface ReserveOrganizationsListProps {
  organizations: Organization[]
  desks: Desk[]
  onOrganizationSelected?: (organizationId: string) => void
}

const ReserveOrganizationsList = ({
  organizations,
  desks,
  onOrganizationSelected,
}: ReserveOrganizationsListProps) => {
  const renderedOrganizations = organizations.map((organization) => (
    <ReserveOrganizationListItem
      organization={organization}
      deskCount={
        desks.filter((desk) => desk.organizationId === organization.id).length
      }
      key={organization.id}
      onClick={onOrganizationSelected}
    />
  ))

  return (
    <ListGroup className="reserve-list" variant="flush">
      {renderedOrganizations}
    </ListGroup>
  )
}

export default ReserveOrganizationsList
