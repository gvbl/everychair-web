import React from 'react'
import { Button, Card } from 'react-bootstrap'
import { Laptop } from 'react-bootstrap-icons'
import { useSelector } from 'react-redux'
import { Shape } from '../../components/HiddenAltImage'
import IconAltImage from '../../components/IconAltImage'
import Desk from '../../models/api/Desk'
import { reviveReservations } from '../../models/revive'
import { RootState } from '../../store'
import { isSameDay } from '../../util/date'
import ReservationDay, {
  toReservationDays,
} from '../reservations/ReservationDay'
import MemberDeskTimesList from './MemberDeskTimesList'

interface ScheduleDesksListItemProps {
  desk: Desk
  date: Date
  onReserve: (deskId: string) => void
}

const ScheduleDesksListItem = ({
  desk,
  date,
  onReserve,
}: ScheduleDesksListItemProps) => {
  const reservationDays = useSelector<RootState, ReservationDay[]>((state) => {
    const reservations = reviveReservations(
      Object.values(state.reservations.entity).filter(
        (reservation) => reservation.deskId === desk.id
      )
    )
    return state.user.entity
      ? toReservationDays(reservations).filter((reservationDay) =>
          isSameDay(reservationDay.timeRange.start, date)
        )
      : []
  })

  return (
    <Card style={{ width: '21rem', height: '10.5rem' }}>
      <Card.Body style={{ flexDirection: 'row' }}>
        <IconAltImage
          title="Desk"
          src={desk.imageUrl}
          width="7rem"
          height="8rem"
          icon={<Laptop color="white" size={64} />}
          shape={Shape.Rounded}
        />
        <div
          className="d-flex flex-column"
          style={{ paddingLeft: '1rem', flex: '1', minWidth: '0' }}
        >
          <h5>{desk.name}</h5>
          {reservationDays.length === 0 && (
            <>
              Available
              <Button
                style={{ alignSelf: 'start', marginTop: '1rem' }}
                onClick={() => onReserve(desk.id)}
                variant="outline-primary"
                size="sm"
              >
                Reserve
              </Button>
            </>
          )}
          {reservationDays.length > 0 && (
            <MemberDeskTimesList reservationDays={reservationDays} />
          )}
        </div>
      </Card.Body>
    </Card>
  )
}

export default ScheduleDesksListItem
