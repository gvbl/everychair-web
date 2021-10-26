import React, { useEffect, useRef } from 'react'
import { ListGroup } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '../..'
import RelativeSpinner from '../../components/RelativeSpinner'
import StopError from '../../components/StopError'
import { isLoading, Loading } from '../../models/Loading'
import { isSmallScreen } from '../../models/mediaQueries'
import { reviveReservations } from '../../models/revive'
import { RootState } from '../../store'
import { fetchDesks } from '../desks/desksSlice'
import { fetchSpaces } from '../desks/spacesSlice'
import MyReservationsEmpty from './MyReservationsEmpty'
import ReservationDay, { toReservationDays } from './ReservationDay'
import ReservationDaysList from './ReservationDaysList'
import { fetchReservations } from './reservationsSlice'
import ReserveButton from './ReserveButton'

interface ReservationsMainSelected {
  reservationDays: ReservationDay[]
  reservationsLoading: Loading
  spacesLoading: Loading
  desksLoading: Loading
}

const MyReservationsMain = () => {
  const dispatch = useDispatch<AppDispatch>()
  const organizationIds = useRef<string[]>([])

  const {
    reservationDays,
    reservationsLoading,
    spacesLoading,
    desksLoading,
  } = useSelector<RootState, ReservationsMainSelected>((state) => {
    organizationIds.current = Object.keys(state.memberships.entity)
    const reservations = reviveReservations(
      Object.values(state.reservations.entity)
    )
    return {
      reservationDays: state.user.entity
        ? toReservationDays(reservations, state.user.entity.id)
        : [],
      reservationsLoading: state.reservations.loading,
      spacesLoading: state.spaces.loading,
      desksLoading: state.desks.loading,
    }
  })

  useEffect(() => {
    dispatch(fetchReservations(organizationIds.current))
    dispatch(fetchSpaces(organizationIds.current))
    dispatch(fetchDesks(organizationIds.current))
  }, [organizationIds, dispatch])

  if (
    isLoading(reservationsLoading) ||
    isLoading(spacesLoading) ||
    isLoading(desksLoading)
  ) {
    return <RelativeSpinner />
  }
  if (
    reservationsLoading === Loading.FAILED ||
    spacesLoading === Loading.FAILED ||
    desksLoading === Loading.FAILED
  ) {
    return <StopError />
  }
  return (
    <>
      {reservationDays.length > 0 ? (
        <div className="d-flex flex-fill h-100" style={{ overflowY: 'auto' }}>
          <ListGroup className="h-100 flex-fill" variant="flush">
            <ReservationDaysList reservationDays={reservationDays} />
          </ListGroup>
          {isSmallScreen() && (
            <ReserveButton
              style={{
                position: 'absolute',
                right: '2rem',
                bottom: '2rem',
                zIndex: 10,
              }}
            />
          )}
        </div>
      ) : (
        <MyReservationsEmpty />
      )}
    </>
  )
}

export default MyReservationsMain
