import React from 'react'
import { Badge } from 'react-bootstrap'
import { ListGroup } from 'react-bootstrap'
import Space from '../../../models/api/Space'

interface ReserveSpaceListItemProps {
  space: Space
  deskCount: number
  onClick?: (spaceId: string) => void
}

const ReserveSpaceListItem = ({
  space,
  deskCount,
  onClick,
}: ReserveSpaceListItemProps) => {
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
          onClick(space.id)
        }
      }}
    >
      <span className={deskCount === 0 ? 'disabled' : undefined}>
        {space.name}
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

export default ReserveSpaceListItem
