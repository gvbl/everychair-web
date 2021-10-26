import React, { useEffect } from 'react'
import { Badge, ListGroup } from 'react-bootstrap'
import { Laptop } from 'react-bootstrap-icons'
import { useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import IconAltImage, { Shape } from '../../components/IconAltImage'
import Desk from '../../models/api/Desk'
import { ReservationParams } from '../../models/ReservationParams'
import { RootState } from '../../store'
import {
  isDone,
  isInProgress,
  isTodayUpcoming,
  isTomorrow,
} from '../../util/date'
import { formatDayLong, formatTimeRange } from '../../util/text'
import { isVisible } from '../../util/util'
import ReservationDay from './ReservationDay'

interface ReservationDaysListItemProps {
  reservationDay: ReservationDay
}

const ReservationDaysListItem = ({
  reservationDay,
}: ReservationDaysListItemProps) => {
  const { reservationId, timeRangeId } = useParams<ReservationParams>()
  const history = useHistory()
  const itemRef = React.useRef<HTMLLIElement>(null)

  const desk = useSelector<RootState, Desk>(
    (state) => state.desks.entity[reservationDay.deskId]
  )

  const isActive =
    reservationDay.id === reservationId &&
    reservationDay.timeRange.id === timeRangeId

  useEffect(() => {
    if (!itemRef.current) {
      return
    }
    if (isActive && !isVisible(itemRef.current)) {
      itemRef.current.scrollIntoView({ block: 'nearest' })
    }
  }, [itemRef, isActive])

  return (
    <ListGroup.Item
      as="li"
      ref={itemRef}
      className="d-flex"
      action
      active={isActive}
      key={reservationDay.id}
      style={{ cursor: 'pointer' }}
      variant="light"
      onClick={() =>
        history.push(
          `/reservations/${reservationDay.id}/days/${reservationDay.timeRange.id}`
        )
      }
    >
      <IconAltImage
        title="Desk"
        src={desk.imageUrl}
        width="7rem"
        height="8rem"
        icon={<Laptop color="white" size={64} />}
        shape={Shape.Rounded}
      />
      <div style={{ flexGrow: 1, paddingLeft: '1rem' }}>
        <div className="d-flex">
          <h5 style={{ flexGrow: 1, marginRight: '0.5rem' }}>{desk.name}</h5>
          <div>
            {isDone(reservationDay.timeRange.end) && (
              <Badge variant="secondary">Done</Badge>
            )}
            {isTodayUpcoming(reservationDay.timeRange.start) && (
              <Badge variant="primary">Today</Badge>
            )}
            {isInProgress(reservationDay.timeRange) && (
              <Badge variant="success">Now</Badge>
            )}
            {isTomorrow(reservationDay.timeRange.start) && (
              <Badge variant="light">Tomorrow</Badge>
            )}
          </div>
        </div>
        <p
          dangerouslySetInnerHTML={{
            __html: formatDayLong(reservationDay.timeRange.start),
          }}
        />
        <span>{formatTimeRange(reservationDay.timeRange)}</span>
      </div>
    </ListGroup.Item>
  )
}

export default ReservationDaysListItem
