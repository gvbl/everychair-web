import React, { useEffect, useRef } from 'react'
import { Button, Container, Table } from 'react-bootstrap'
import { Building } from 'react-bootstrap-icons'
import { useDispatch, useSelector } from 'react-redux'
import { LinkContainer } from 'react-router-bootstrap'
import { Link, useLocation, useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import AddressText from '../../components/AddressText'
import RelativeSpinner from '../../components/RelativeSpinner'
import { Shape } from '../../components/HiddenAltImage'
import IconAltImage from '../../components/IconAltImage'
import StopError from '../../components/StopError'
import Location from '../../models/api/Location'
import { isLoading, Loading } from '../../models/Loading'
import { LocationParams } from '../../models/LocationParams'
import { RootState } from '../../store'
import AddSpaceButton from './AddSpaceButton'
import { fetchLocations } from './locationsSlice'

interface LocationDetailInnerProps {
  location: Location
}

const LocationDetailInner = ({ location }: LocationDetailInnerProps) => {
  const urlLocation = useLocation()

  if (!location) {
    return null
  }

  return (
    <div className="h-100 w-100" style={{ overflowY: 'auto' }}>
      <Container style={{ padding: '0' }}>
        <Table className="table-borderless">
          <tbody>
            <tr className="table-separator">
              <td>
                <b>Location name</b>
                <p>{location.name}</p>
              </td>
              <td className="text-right">
                <Link to={`${urlLocation.pathname}/edit-location-name`}>
                  Edit
                </Link>
              </td>
            </tr>
            <tr className="table-separator">
              <td>
                <b>Image</b>
                <div style={{ marginTop: '0.5rem' }}>
                  <IconAltImage
                    title="Image"
                    src={location.imageUrl}
                    width="6rem"
                    height="6rem"
                    icon={<Building color="white" size={64} />}
                    shape={Shape.Rounded}
                  />
                </div>
              </td>
              <td className="text-right">
                <Link to={`${urlLocation.pathname}/edit-location-image`}>
                  Edit
                </Link>
                {location.imageUrl && (
                  <>
                    <br />
                    <Link to={`${urlLocation.pathname}/remove-location-image`}>
                      Remove
                    </Link>
                  </>
                )}
              </td>
            </tr>
            <tr className="table-separator">
              <td>
                <b>Address</b>
                <p>
                  <AddressText address={location.address} emptyText="None" />
                </p>
              </td>
              <td className="text-right">
                <Link to={`${urlLocation.pathname}/edit-location-address`}>
                  Edit
                </Link>
                <br />
                <Link to={`${urlLocation.pathname}/remove-location-address`}>
                  Remove
                </Link>
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <b>Time zone</b>
                <p>{location.timeZone}</p>
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="text-center">
                <LinkContainer to={`${urlLocation.pathname}/delete-location`}>
                  <Button variant="danger">Delete location</Button>
                </LinkContainer>
              </td>
            </tr>
          </tbody>
        </Table>
        <AddSpaceButton />
      </Container>
    </div>
  )
}

interface LocationDetailSelected {
  locationsLoading: Loading
  location?: Location
}

const LocationDetail = () => {
  const dispatch = useDispatch<AppDispatch>()
  const organizationIds = useRef<string[]>([])

  const { locationId } = useParams<LocationParams>()
  const { locationsLoading, location } = useSelector<
    RootState,
    LocationDetailSelected
  >((state) => {
    organizationIds.current = Object.keys(state.memberships.entity)
    return {
      locationsLoading: state.locations.loading,
      location: locationId ? state.locations.entity[locationId] : undefined,
    }
  })

  useEffect(() => {
    dispatch(fetchLocations(organizationIds.current))
  }, [organizationIds, dispatch])

  if (isLoading(locationsLoading)) {
    return <RelativeSpinner />
  }

  if (locationsLoading === Loading.FAILED) {
    return <StopError />
  }

  return location ? <LocationDetailInner location={location} /> : null
}

export default LocationDetail
