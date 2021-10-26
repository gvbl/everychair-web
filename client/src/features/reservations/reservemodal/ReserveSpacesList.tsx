import React from 'react'
import { ListGroup } from 'react-bootstrap'
import Space from '../../../models/api/Space'
import ReserveSpaceListItem from './ReserveSpaceListItem'
import './ReserveList.css'
import Desk from '../../../models/api/Desk'

interface ReserveSpacesListProps {
  spaces: Space[]
  desks: Desk[]
  onSpaceSelected?: (spaceId: string) => void
}

const ReserveSpacesList = ({
  spaces,
  desks,
  onSpaceSelected,
}: ReserveSpacesListProps) => {
  const renderedSpaces = spaces.map((space) => (
    <ReserveSpaceListItem
      space={space}
      deskCount={desks.filter((desk) => desk.spaceId === space.id).length}
      key={space.id}
      onClick={onSpaceSelected}
    />
  ))

  return (
    <ListGroup className="reserve-list" variant="flush">
      {renderedSpaces}
    </ListGroup>
  )
}

export default ReserveSpacesList
