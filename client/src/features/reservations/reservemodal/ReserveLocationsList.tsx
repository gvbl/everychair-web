import React from 'react'
import { ListGroup } from 'react-bootstrap'
import Location from '../../../models/api/Location'
import ReserveLocationListItem from './ReserveLocationListItem'
import './ReserveList.css'
import Desk from '../../../models/api/Desk'

interface ReserveLocationsListProps {
  locations: Location[]
  desks: Desk[]
  onLocationSelected?: (locationId: string) => void
}

const ReserveLocationsList = ({
  locations,
  desks,
  onLocationSelected,
}: ReserveLocationsListProps) => {
  const renderedLocations = locations.map((location) => (
    <ReserveLocationListItem
      location={location}
      deskCount={desks.filter((desk) => desk.locationId === location.id).length}
      key={location.id}
      onClick={onLocationSelected}
    />
  ))

  return (
    <ListGroup className="reserve-list" variant="flush">
      {renderedLocations}
    </ListGroup>
  )
}

export default ReserveLocationsList
