import React from 'react'
import Location from '../../models/api/Location'
import ScheduleLocationsListItem from './ScheduleLocationsListItem'

interface ScheduleLocationsListProps {
  locations: Location[]
}

const ScheduleLocationsList = ({ locations }: ScheduleLocationsListProps) => {
  const renderedScheduleLocations = locations.map((location) => (
    <ScheduleLocationsListItem location={location} key={location.id} />
  ))

  return <>{renderedScheduleLocations}</>
}

export default ScheduleLocationsList
