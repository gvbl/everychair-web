import React from 'react'
import { Table } from 'react-bootstrap'
import Organization from '../../models/api/Organization'
import ScheduleOrganizationsListItem from './ScheduleOrganizationsListItem'

interface ScheduleListProps {
  organizations: Organization[]
}

const ScheduleOrganizationsList = ({ organizations }: ScheduleListProps) => {
  const renderedScheduleOrganizations = organizations.map((organization) => (
    <ScheduleOrganizationsListItem
      organization={organization}
      key={organization.id}
    />
  ))

  return (
    <Table className="table-borderless">
      <tbody>{renderedScheduleOrganizations}</tbody>
    </Table>
  )
}

export default ScheduleOrganizationsList
