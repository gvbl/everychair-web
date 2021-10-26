import React from 'react'
import { ListGroup } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { ScheduleParams } from '../../models/ScheduleParams'
import { RootState } from '../../store'
import ReservationDay from '../reservations/ReservationDay'
import CleaningDeskListItem from './CleaningDeskListItem'
import MemberDeskTimeListItem from './MemberDeskTimeListItem'

interface MemberDeskTimesListProps {
  reservationDays: ReservationDay[]
}

const MemberDeskTimesList = ({ reservationDays }: MemberDeskTimesListProps) => {
  const { organizationId } = useParams<ScheduleParams>()

  const cleaning = useSelector<RootState, boolean>(
    (state) => state.memberships.entity[organizationId].organization.cleaning
  )

  const renderedItems = reservationDays.map((reservationDay) => (
    <MemberDeskTimeListItem
      reservationDay={reservationDay}
      key={reservationDay.id}
    />
  ))

  if (cleaning) {
    for (let i = 0; i < reservationDays.length; i++) {
      renderedItems.splice(
        i * 2 + 1,
        0,
        <CleaningDeskListItem
          start={reservationDays[i].timeRange.end}
          key={`${reservationDays[i].timeRange.id}-cleaning`}
        />
      )
    }
  }

  const startScroll = cleaning ? 1 : 2

  return (
    <ListGroup
      style={reservationDays.length > startScroll ? { overflowY: 'auto' } : {}}
    >
      {renderedItems}
    </ListGroup>
  )
}

export default MemberDeskTimesList
