import React, { useEffect, useRef, useState } from 'react'
import { Button, ButtonGroup, Container } from 'react-bootstrap'
import { Building, ChevronLeft, Dash, Plus } from 'react-bootstrap-icons'
import DatePicker from 'react-datepicker'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import RelativeSpinner from '../../components/RelativeSpinner'
import { Shape } from '../../components/HiddenAltImage'
import IconAltImage from '../../components/IconAltImage'
import StopError from '../../components/StopError'
import Desk from '../../models/api/Desk'
import Location from '../../models/api/Location'
import Space from '../../models/api/Space'
import { isLoading, Loading } from '../../models/Loading'
import { ScheduleParams } from '../../models/ScheduleParams'
import { isSmallScreen } from '../../models/mediaQueries'
import { RootState } from '../../store'
import {
  beginningOfDay,
  dayAfter,
  dayBefore,
  endOfDay,
  isBeforeEOD,
  isToday,
  today,
} from '../../util/date'
import { formatDayLong, formatDayShort } from '../../util/text'
import { fetchDesks } from '../desks/desksSlice'
import { fetchLocations } from '../desks/locationsSlice'
import { fetchSpaces } from '../desks/spacesSlice'
import { fetchMembers } from '../members/membersSlice'
import { fetchReservations } from '../reservations/reservationsSlice'
import ScheduleEmpty from './ScheduleEmpty'
import ScheduleSpacesList from './ScheduleSpacesList'
import './ScheduleDetail.css'
import { useQuery } from '../../util/query'

interface ScheduleDetailSelected {
  membershipsCount: number
  locationsCount: number
  location: Location
  spaces: Space[]
  desks: Record<string, Desk>
  reservationsLoading: Loading
  locationsLoading: Loading
  spacesLoading: Loading
  desksLoading: Loading
  membersLoading: Loading
}

const ScheduleDetail = () => {
  const { organizationId, locationId } = useParams<ScheduleParams>()
  const date = useQuery().get('date')
  const history = useHistory()
  const dispatch = useDispatch<AppDispatch>()
  const urlLocation = useLocation()
  const organizationIds = useRef<string[]>([])

  const [mapDate, setMapDate] = useState(today())

  useEffect(() => {
    if (!date) {
      setMapDate(new Date())
      return
    }
    setMapDate(new Date(parseInt(date)))
  }, [date, setMapDate])

  const {
    membershipsCount,
    locationsCount,
    location,
    spaces,
    desks,
    reservationsLoading,
    locationsLoading,
    spacesLoading,
    desksLoading,
    membersLoading,
  } = useSelector<RootState, ScheduleDetailSelected>((state) => {
    organizationIds.current = Object.keys(state.memberships.entity)
    return {
      membershipsCount: Object.values(state.memberships.entity).length,
      locationsCount: Object.values(state.locations.entity).filter(
        (location) => location.organizationId === organizationId
      ).length,
      location: state.locations.entity[locationId],
      spaces: Object.values(state.spaces.entity).filter(
        (space) => space.locationId === locationId
      ),
      desks: state.desks.entity,
      reservationsLoading: state.reservations.loading,
      locationsLoading: state.locations.loading,
      spacesLoading: state.spaces.loading,
      desksLoading: state.desks.loading,
      membersLoading: state.members.loading,
    }
  })

  useEffect(() => {
    dispatch(fetchReservations(organizationIds.current))
    dispatch(fetchLocations(organizationIds.current))
    dispatch(fetchSpaces(organizationIds.current))
    dispatch(fetchDesks(organizationIds.current))
    dispatch(fetchMembers(organizationIds.current))
  }, [organizationIds, dispatch])

  if (
    isLoading(reservationsLoading) ||
    isLoading(locationsLoading) ||
    isLoading(spacesLoading) ||
    isLoading(desksLoading) ||
    isLoading(membersLoading)
  ) {
    return <RelativeSpinner />
  }

  if (
    reservationsLoading === Loading.FAILED ||
    locationsLoading === Loading.FAILED ||
    spacesLoading === Loading.FAILED ||
    desksLoading === Loading.FAILED ||
    membersLoading === Loading.FAILED
  ) {
    return <StopError />
  }

  const handleReserve = (deskId: string) => {
    const desk = desks[deskId]
    history.push(`${urlLocation.pathname}/reserve`, {
      organizationId: desk.organizationId,
      locationId: desk.locationId,
      spaceId: desk.spaceId,
      deskId: desk.id,
      days: [isBeforeEOD() ? mapDate : dayAfter(mapDate)],
      startTime: isBeforeEOD() ? beginningOfDay() : null,
      endTime: isBeforeEOD() ? endOfDay() : null,
      background: {
        pathname: urlLocation.pathname,
        search: urlLocation.search,
      },
    })
  }

  return (
    <>
      <div className="h-100" style={{ overflowY: 'auto' }}>
        <div className="d-flex">
          <div style={{ flex: 1 }}>
            <Button
              variant="light"
              onClick={async () => {
                history.push('/schedule')
              }}
              style={{ margin: '1rem' }}
              hidden={membershipsCount === 1 && locationsCount === 1}
            >
              {!isSmallScreen() && (
                <div className="d-flex align-items-center">
                  <ChevronLeft size={16} style={{ marginRight: '0.5rem' }} />
                  <IconAltImage
                    title="Image"
                    src={location.imageUrl}
                    width="2.5rem"
                    height="2.5rem"
                    icon={<Building color="white" size={24} />}
                    shape={Shape.Rounded}
                  />
                  <div className="text-left" style={{ marginLeft: '1rem' }}>
                    <b>{location.name}</b>
                    {location.address?.street && (
                      <>
                        <br />
                        {location.address?.street}
                      </>
                    )}
                  </div>
                </div>
              )}
            </Button>
          </div>
          <div className="text-center" style={{ flex: 1 }}>
            <ButtonGroup style={{ marginTop: '1rem' }}>
              <Button
                variant="light"
                onClick={() =>
                  history.push(
                    `${urlLocation.pathname}?date=${new Date(
                      dayBefore(mapDate)
                    ).getTime()}`
                  )
                }
                disabled={isToday(mapDate)}
              >
                <Dash />
              </Button>
              <DatePicker
                calendarClassName="unselectable"
                popperClassName="center-popper"
                minDate={today()}
                selected={mapDate}
                highlightDates={[mapDate]}
                onChange={(date) => {
                  if (!(date instanceof Date)) {
                    return
                  }
                  history.push(`${urlLocation.pathname}?date=${date.getTime()}`)
                }}
                customInput={
                  <Button variant="light">
                    <div
                      className="text-center"
                      style={
                        isSmallScreen()
                          ? { width: '5.5rem' }
                          : { width: '11.5rem' }
                      }
                    >
                      <span
                        dangerouslySetInnerHTML={
                          isSmallScreen()
                            ? { __html: formatDayShort(mapDate, true) }
                            : { __html: formatDayLong(mapDate, true) }
                        }
                      />
                      {}
                    </div>
                  </Button>
                }
              />

              <Button
                variant="light"
                onClick={() =>
                  history.push(
                    `${urlLocation.pathname}?date=${new Date(
                      dayAfter(mapDate)
                    ).getTime()}`
                  )
                }
              >
                <Plus />
              </Button>
            </ButtonGroup>
          </div>
          <div style={{ flex: 1 }} />
        </div>
        <Container style={{ padding: '0' }}>
          {spaces.length > 0 ? (
            <ScheduleSpacesList
              spaces={spaces}
              date={mapDate}
              onReserve={handleReserve}
            />
          ) : (
            <ScheduleEmpty
              organizationId={organizationId}
              manageMessage="This location currently has no spaces. You can create spaces from the Manage console."
              manageLink={`/manage/organizations/${organizationId}/desks/locations/${locationId}`}
              standardMessage="Your administrator has not created any spaces for this location."
            />
          )}
        </Container>
      </div>
    </>
  )
}

export default ScheduleDetail
