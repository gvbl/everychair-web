import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect, Route, Switch } from 'react-router-dom'
import { AppDispatch } from '../..'
import RelativeSpinner from '../../components/RelativeSpinner'
import StopError from '../../components/StopError'
import { isLoading, Loading } from '../../models/Loading'
import { reviveReservations } from '../../models/revive'
import { RootState } from '../../store'
import { fetchDesks } from '../desks/desksSlice'
import { fetchLocations } from '../desks/locationsSlice'
import { fetchSpaces } from '../desks/spacesSlice'
import ReservationDay, { toReservationDays } from './ReservationDay'
import ReservationDayDetail from './ReservationDayDetail'
import MyReservationsEmpty from './MyReservationsEmpty'
import MyReservationsMain from './MyReservationsMain'
import { fetchReservations } from './reservationsSlice'
import ReserveButton from './ReserveButton'

interface ReservationsPageSelected {
  reservationDays: ReservationDay[]
  reservationsLoading: Loading
  locationsLoading: Loading
  spacesLoading: Loading
  desksLoading: Loading
}

const MyReservationsPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const organizationIds = useRef<string[]>([])

  const {
    reservationDays,
    reservationsLoading,
    locationsLoading,
    spacesLoading,
    desksLoading,
  } = useSelector<RootState, ReservationsPageSelected>((state) => {
    organizationIds.current = Object.keys(state.memberships.entity)
    const reservations = reviveReservations(
      Object.values(state.reservations.entity)
    )
    return {
      organizationIds: Object.keys(state.memberships.entity),
      reservationDays: state.user.entity
        ? toReservationDays(reservations, state.user.entity.id)
        : [],
      reservationsLoading: state.reservations.loading,
      locationsLoading: state.locations.loading,
      spacesLoading: state.spaces.loading,
      desksLoading: state.desks.loading,
    }
  })

  useEffect(() => {
    dispatch(fetchReservations(organizationIds.current))
    dispatch(fetchLocations(organizationIds.current))
    dispatch(fetchSpaces(organizationIds.current))
    dispatch(fetchDesks(organizationIds.current))
  }, [organizationIds, dispatch])

  if (
    isLoading(reservationsLoading) ||
    isLoading(locationsLoading) ||
    isLoading(spacesLoading) ||
    isLoading(desksLoading)
  ) {
    return <RelativeSpinner />
  }

  if (
    reservationsLoading === Loading.FAILED ||
    locationsLoading === Loading.FAILED ||
    spacesLoading === Loading.FAILED ||
    desksLoading === Loading.FAILED
  ) {
    return <StopError />
  }
  return (
    <>
      {reservationDays.length > 0 ? (
        <>
          <div className="d-flex h-100">
            <div
              className="d-flex h-100"
              style={{
                flex: '1',
                borderRight: '1px solid #dee2e6',
              }}
            >
              <MyReservationsMain />
            </div>
            <div className="d-flex h-100" style={{ flex: '2' }}>
              <Switch>
                <Route exact path="/reservations">
                  <Redirect
                    to={`/reservations/${reservationDays[0].id}/days/${reservationDays[0].timeRange.id}`}
                  />
                </Route>
                <Route
                  path="/reservations/:reservationId/days/:timeRangeId"
                  component={ReservationDayDetail}
                />
              </Switch>
            </div>
          </div>
          <ReserveButton
            style={{
              position: 'absolute',
              right: '2rem',
              bottom: '2rem',
              zIndex: 10,
            }}
          />
        </>
      ) : (
        <MyReservationsEmpty />
      )}
    </>
  )
}

export default MyReservationsPage
