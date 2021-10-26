import React from 'react'
import { ListGroup } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import Location from '../../models/api/Location'
import Space from '../../models/api/Space'
import { RootState } from '../../store'
import LocationListItem from './LocationListItem'
import SpaceListItem from './SpaceListItem'

interface LocationListGroupProps {
  location: Location
}

const LocationListGroup = ({ location }: LocationListGroupProps) => {
  const spaces = useSelector<RootState, Space[]>((state) =>
    Object.values(state.spaces.entity).filter(
      (space) => space.locationId === location.id
    )
  )

  const renderedSpaces = spaces.map((space) => (
    <SpaceListItem space={space} key={space.id} />
  ))

  return (
    <>
      <LocationListItem location={location} key={location.id} />
      {spaces.length > 0 && (
        <ListGroup.Item
          as="li"
          variant="secondary"
          key={`location-${location.id}-spaces-header`}
        >
          Spaces
        </ListGroup.Item>
      )}
      {renderedSpaces}
    </>
  )
}

export default LocationListGroup
