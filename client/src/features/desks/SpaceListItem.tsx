import React, { useEffect } from 'react'
import { ListGroup } from 'react-bootstrap'
import { useHistory, useParams } from 'react-router-dom'
import Space from '../../models/api/Space'
import { SpaceParams } from '../../models/SpaceParams'
import { isVisible } from '../../util/util'

interface SpaceListItemProps {
  space: Space
}

const SpaceListItem = ({ space }: SpaceListItemProps) => {
  const { organizationId, spaceId } = useParams<SpaceParams>()
  const history = useHistory()
  const itemRef = React.useRef<HTMLLIElement>(null)

  const isActive = space.id === spaceId
  useEffect(() => {
    if (!itemRef.current) {
      return
    }
    if (isActive && !isVisible(itemRef.current)) {
      itemRef.current.scrollIntoView({ block: 'nearest' })
    }
  }, [itemRef, isActive])

  return (
    <ListGroup.Item
      as="li"
      ref={itemRef}
      action
      active={isActive}
      style={{ cursor: 'pointer' }}
      variant="light"
      onClick={() =>
        history.push(
          `/manage/organizations/${organizationId}/desks/locations/${space.locationId}/spaces/${space.id}`
        )
      }
    >
      <div style={{ textIndent: '4rem' }}>{space.name}</div>
    </ListGroup.Item>
  )
}

export default SpaceListItem
