import React from 'react'
import ReservationDay from './ReservationDay'
import ReservationDaysListItem from './ReservationDaysListItem'

interface ReservationsDaysListProps {
  reservationDays: ReservationDay[]
}

const ReservationDaysList = ({
  reservationDays,
}: ReservationsDaysListProps) => {
  const renderedReservationDays = reservationDays.map((reservationDay) => (
    <ReservationDaysListItem
      reservationDay={reservationDay}
      key={`${reservationDay.id}_${reservationDay.timeRange.id}`}
    />
  ))

  return <>{renderedReservationDays}</>
}

export default ReservationDaysList
