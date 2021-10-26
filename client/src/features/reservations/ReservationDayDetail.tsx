import React, { useEffect, useRef } from 'react'
import { Button, Col, Container, Row, Table } from 'react-bootstrap'
import { Building, Map } from 'react-bootstrap-icons'
import { useDispatch, useSelector } from 'react-redux'
import { LinkContainer } from 'react-router-bootstrap'
import { useLocation, useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import AddressText from '../../components/AddressText'
import RelativeSpinner from '../../components/RelativeSpinner'
import HiddenAltImage, { Shape } from '../../components/HiddenAltImage'
import IconAltImage from '../../components/IconAltImage'
import StopError from '../../components/StopError'
import Desk from '../../models/api/Desk'
import Location, { Address } from '../../models/api/Location'
import Organization from '../../models/api/Organization'
import Reservation, { TimeRange } from '../../models/api/Reservation'
import Space from '../../models/api/Space'
import { isLoading, Loading } from '../../models/Loading'
import { ReservationParams } from '../../models/ReservationParams'
import { reviveReservation } from '../../models/revive'
import { RootState } from '../../store'
import { formatDayLong, formatTimeRange } from '../../util/text'
import DeskCard from '../desks/DeskCard'
import { fetchDesks } from '../desks/desksSlice'
import { fetchLocations } from '../desks/locationsSlice'
import { fetchSpaces } from '../desks/spacesSlice'
import { fetchReservations } from './reservationsSlice'

const generateGoogleMapsLink = (address?: Address) => {
  if (!address) {
    return ''
  }
  const queryParam = encodeURI(
    `${address.street} ${address.city} ${address.state} ${address.zip}`
  )
  return `http://maps.google.com/?q=${queryParam}`
}

interface ReservationDayDetailInnerProps {
  organization: Organization
  location: Location
  space: Space
  desk: Desk
  timeRange: TimeRange
  showCancel: boolean
}

const ReservationDayDetailInner = ({
  organization,
  location,
  space,
  desk,
  timeRange,
  showCancel,
}: ReservationDayDetailInnerProps) => {
  const urlLocation = useLocation()

  return (
    <div className="h-100 w-100" style={{ overflowY: 'auto' }}>
      <Container>
        <Row>
          <Col className="d-flex justify-content-center" xs={12} lg="auto">
            <div style={{ margin: '1rem' }}>
              <DeskCard desk={desk} large />
            </div>
          </Col>
          <Col>
            <Table className="table-borderless">
              <tbody>
                <tr className="table-separator">
                  <td colSpan={2} className="first-column">
                    <b>Time</b>
                    <p>{formatTimeRange(timeRange)}</p>
                  </td>
                </tr>
                <tr className="table-separator">
                  <td colSpan={2} className="first-column">
                    <b>Day</b>
                    <p>{formatDayLong(timeRange.start, false)}</p>
                  </td>
                </tr>
                <tr className="table-separator">
                  <td colSpan={2} className="first-column">
                    <b>Space</b>
                    <p>{space.name}</p>
                  </td>
                </tr>
                <tr className="table-separator">
                  <td colSpan={2} className="first-column">
                    <b>Location</b>
                    <div
                      className="d-flex align-items-center"
                      style={{ marginTop: '0.5rem', marginBottom: '1rem' }}
                    >
                      <IconAltImage
                        title="Image"
                        src={location.imageUrl}
                        width="6rem"
                        height="6rem"
                        icon={<Building color="white" size={64} />}
                        shape={Shape.Rounded}
                      />
                      <div
                        className="d-flex flex-column"
                        style={{ marginLeft: '1rem' }}
                      >
                        <h5>{location.name}</h5>
                        <Button
                          variant="light"
                          onClick={() =>
                            window.open(
                              generateGoogleMapsLink(location.address),
                              '_blank'
                            )
                          }
                          hidden={!location.address}
                        >
                          <div className="d-flex align-items-center text-left">
                            <AddressText address={location.address} />
                            <Map
                              size={32}
                              style={{
                                marginLeft: '1.5rem',
                                color: '#007bff',
                              }}
                            />
                          </div>
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="first-column">
                    <b>Organization</b>
                    {organization.iconUrl ? (
                      <div
                        className="d-flex align-items-center"
                        style={{ marginTop: '0.5rem' }}
                      >
                        <HiddenAltImage
                          title="Icon"
                          src={organization.iconUrl}
                          width="2.5rem"
                          height="2.5rem"
                          style={
                            organization.iconUrl ? { marginRight: '1rem' } : {}
                          }
                        />
                        <h5>{organization.name}</h5>
                      </div>
                    ) : (
                      <p>{organization.name}</p>
                    )}
                  </td>
                </tr>
                <tr hidden={!showCancel}>
                  <td className="text-center">
                    <LinkContainer to={`${urlLocation.pathname}/cancel-day`}>
                      <Button variant="danger">Cancel day</Button>
                    </LinkContainer>
                  </td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

interface ReservationsDetailSelected {
  reservation?: Reservation
  organization?: Organization
  location?: Location
  space?: Space
  desk?: Desk
  timeRange?: TimeRange
  reservationsLoading: Loading
  locationsLoading: Loading
  spacesLoading: Loading
  desksLoading: Loading
}

const ReservationDayDetail = () => {
  const { reservationId, timeRangeId } = useParams<ReservationParams>()
  const urlLocation = useLocation()
  const dispatch = useDispatch<AppDispatch>()
  const organizationIds = useRef<string[]>([])

  const {
    reservation,
    organization,
    location,
    space,
    desk,
    timeRange,
    reservationsLoading,
    locationsLoading,
    spacesLoading,
    desksLoading,
  } = useSelector<RootState, ReservationsDetailSelected>((state) => {
    organizationIds.current = Object.keys(state.memberships.entity)
    const rawReservation = state.reservations.entity[reservationId]
    const reservation = rawReservation
      ? reviveReservation(rawReservation)
      : undefined
    return {
      reservation: reservation,
      organization: reservation
        ? state.memberships.entity[reservation.organizationId].organization
        : undefined,
      location: reservation
        ? state.locations.entity[reservation.locationId]
        : undefined,
      space: reservation ? state.spaces.entity[reservation.spaceId] : undefined,
      desk: reservation ? state.desks.entity[reservation.deskId] : undefined,
      timeRange: reservation
        ? reservation.timeRanges.find(
            (timeRange) => timeRange.id === timeRangeId
          )
        : undefined,
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

  const isCleaning = urlLocation.pathname.split('/')[1] === 'cleaning'

  return (
    <>
      {reservation &&
        organization &&
        location &&
        space &&
        desk &&
        timeRange && (
          <ReservationDayDetailInner
            organization={organization}
            location={location}
            space={space}
            desk={desk}
            timeRange={timeRange}
            showCancel={!isCleaning}
          />
        )}
    </>
  )
}

export default ReservationDayDetail
