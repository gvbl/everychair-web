import React, { useEffect, useRef } from 'react'
import { ListGroup } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import RelativeSpinner from '../../components/RelativeSpinner'
import StopError from '../../components/StopError'
import Location from '../../models/api/Location'
import { isLoading, Loading } from '../../models/Loading'
import { OrganizationParams } from '../../models/OrganizationParams'
import { RootState } from '../../store'
import AddLocationButton from './AddLocationButton'
import LocationListGroup from './LocationListGroup'
import { fetchLocations } from './locationsSlice'
import { fetchSpaces } from './spacesSlice'

interface DesksMainSelected {
  locationsLoading: Loading
  locations: Location[]
  spacesLoading: Loading
}

const DesksMain = () => {
  const { organizationId } = useParams<OrganizationParams>()
  const dispatch = useDispatch<AppDispatch>()
  const organizationIds = useRef<string[]>([])

  const { locationsLoading, locations, spacesLoading } = useSelector<
    RootState,
    DesksMainSelected
  >((state) => {
    organizationIds.current = Object.keys(state.memberships.entity)
    return {
      locationsLoading: state.locations.loading,
      locations: Object.values(state.locations.entity).filter(
        (location) => location.organizationId === organizationId
      ),
      spacesLoading: state.spaces.loading,
    }
  })

  useEffect(() => {
    dispatch(fetchLocations(organizationIds.current))
    dispatch(fetchSpaces(organizationIds.current))
  }, [organizationIds, dispatch])

  if (isLoading(locationsLoading) || isLoading(spacesLoading)) {
    return <RelativeSpinner />
  }
  if (locationsLoading === Loading.FAILED || spacesLoading === Loading.FAILED) {
    return <StopError />
  }
  const renderedLocations = locations.map((location) => (
    <ListGroup style={{ marginBottom: '1rem' }} key={location.id}>
      <LocationListGroup location={location} />
    </ListGroup>
  ))

  return (
    <div
      className="h-100 flex-fill"
      style={{ position: 'relative', overflowY: 'auto' }}
    >
      <div className="h-100" style={{ padding: '0.5rem' }}>
        <h2>Locations</h2>
        {renderedLocations}
      </div>
      <AddLocationButton
        style={{
          position: 'absolute',
          right: '2rem',
          bottom: '2rem',
          zIndex: 10,
        }}
      />
    </div>
  )
}

export default DesksMain
