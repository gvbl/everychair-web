import React from 'react'
import { Badge } from 'react-bootstrap'
import { ListGroup } from 'react-bootstrap'
import Location from '../../../models/api/Location'

interface ReserveLocationListItemProps {
  location: Location
  deskCount: number
  onClick?: (locationId: string) => void
}

const ReserveLocationListItem = ({
  location,
  deskCount,
  onClick,
}: ReserveLocationListItemProps) => {
  return (
    <ListGroup.Item
      as="li"
      className="d-flex"
      disabled={deskCount === 0}
      action
      style={{ cursor: 'pointer', justifyContent: 'space-between' }}
      variant="light"
      onClick={() => {
        if (onClick) {
          onClick(location.id)
        }
      }}
    >
      <span className={deskCount === 0 ? 'disabled' : undefined}>
        {location.name}
      </span>
      <Badge
        style={{ alignSelf: 'center' }}
        variant={deskCount === 0 ? 'secondary' : 'primary'}
      >
        {deskCount}
      </Badge>
    </ListGroup.Item>
  )
}

export default ReserveLocationListItem
