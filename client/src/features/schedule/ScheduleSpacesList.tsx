import React from 'react'
import { Table } from 'react-bootstrap'
import Space from '../../models/api/Space'
import ScheduleSpacesListItem from './ScheduleSpacesListItem'

interface ScheduleSpacesProps {
  spaces: Space[]
  date: Date
  onReserve: (deskId: string) => void
}

const ScheduleSpacesList = ({
  spaces,
  date,
  onReserve,
}: ScheduleSpacesProps) => {
  const renderedScheduleSpaces = spaces.map((space) => (
    <ScheduleSpacesListItem
      space={space}
      date={date}
      onReserve={onReserve}
      key={space.id}
    />
  ))

  return (
    <Table className="table-borderless">
      <tbody>{renderedScheduleSpaces}</tbody>
    </Table>
  )
}

export default ScheduleSpacesList
