import React, { useEffect } from 'react'
import { ListGroup } from 'react-bootstrap'
import { Building } from 'react-bootstrap-icons'
import { useHistory, useParams } from 'react-router-dom'
import { Shape } from '../../components/HiddenAltImage'
import IconAltImage from '../../components/IconAltImage'
import Location from '../../models/api/Location'
import { SpaceParams } from '../../models/SpaceParams'
import { isVisible } from '../../util/util'

interface LocationListItemProps {
  location: Location
}

const LocationListItem = ({ location }: LocationListItemProps) => {
  const { organizationId, locationId, spaceId } = useParams<SpaceParams>()
  const history = useHistory()
  const itemRef = React.useRef<HTMLLIElement>(null)

  const isActive = location.id === locationId && !spaceId
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
          `/manage/organizations/${organizationId}/desks/locations/${location.id}`
        )
      }
    >
      <div className="d-flex align-items-center">
        <IconAltImage
          title="Image"
          src={location.imageUrl}
          width="3rem"
          height="3rem"
          icon={<Building color="white" size={32} />}
          shape={Shape.Rounded}
        />
        <h5 style={{ marginLeft: '1rem' }}>{location.name}</h5>
      </div>
    </ListGroup.Item>
  )
}

export default LocationListItem
