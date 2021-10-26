import React from 'react'
import Desk from '../../models/api/Desk'
import ScheduleDeskListItem from './ScheduleDeskListItem'

interface ScheduleDesksListProps {
  desks: Desk[]
  date: Date
  onReserve: (deskId: string) => void
}

const ScheduleDesksList = ({
  desks,
  date,
  onReserve,
}: ScheduleDesksListProps) => {
  const renderedScheduleDesks = desks.map((desk) => (
    <ScheduleDeskListItem
      desk={desk}
      date={date}
      onReserve={onReserve}
      key={desk.id}
    />
  ))

  return <>{renderedScheduleDesks}</>
}

export default ScheduleDesksList
