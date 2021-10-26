import React from 'react'
import { Card, ListGroup } from 'react-bootstrap'
import { Building } from 'react-bootstrap-icons'
import { useHistory } from 'react-router-dom'
import AddressText from '../../components/AddressText'
import { Shape } from '../../components/HiddenAltImage'
import IconAltImage from '../../components/IconAltImage'
import Location from '../../models/api/Location'

interface ScheduleLocationsListItemProps {
  location: Location
}

const ScheduleLocationsListItem = ({
  location,
}: ScheduleLocationsListItemProps) => {
  const history = useHistory()

  return (
    <ListGroup.Item
      as="div"
      action
      style={{
        cursor: 'pointer',
        margin: '0',
        padding: '0',
        borderStyle: 'none',
        borderRadius: '0.25rem',
      }}
      variant="light"
    >
      <Card
        style={{ margin: '0.5rem', backgroundColor: 'transparent' }}
        onClick={async () => {
          history.push(
            `/schedule/organizations/${location.organizationId}/locations/${location.id}`
          )
        }}
      >
        <Card.Body style={{ flexDirection: 'row' }}>
          <IconAltImage
            title="Image"
            src={location.imageUrl}
            width="6rem"
            height="6rem"
            icon={<Building color="white" size={64} />}
            shape={Shape.Rounded}
          />
          <div
            className="d-flex flex-column justify-content-center"
            style={{ paddingLeft: '1rem' }}
          >
            <h5>{location.name}</h5>
            <AddressText address={location.address} />
          </div>
        </Card.Body>
      </Card>
    </ListGroup.Item>
  )
}

export default ScheduleLocationsListItem
