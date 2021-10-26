import React from 'react'
import Location from '../../models/api/Location'
import LocationListGroup from './LocationListGroup'

interface LocationListProps {
  locations: Location[]
}

const LocationList = ({ locations }: LocationListProps) => {
  const renderedLocations = locations.map((location) => (
    <LocationListGroup location={location} key={location.id} />
  ))

  return <>{renderedLocations}</>
}

export default LocationList
