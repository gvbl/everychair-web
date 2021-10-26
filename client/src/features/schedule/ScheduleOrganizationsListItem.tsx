import React from 'react'
import { ListGroup } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import HiddenAltImage from '../../components/HiddenAltImage'
import Location from '../../models/api/Location'
import Organization from '../../models/api/Organization'
import { RootState } from '../../store'
import ScheduleEmpty from './ScheduleEmpty'
import ScheduleLocationsList from './ScheduleLocationsList'

interface ScheduleOrganizationsListItemProps {
  organization: Organization
}

const ScheduleOrganizationsListItem = ({
  organization,
}: ScheduleOrganizationsListItemProps) => {
  const locations = useSelector<RootState, Location[]>((state) =>
    Object.values(state.locations.entity).filter(
      (location) => location.organizationId === organization.id
    )
  )

  return (
    <>
      <tr>
        <td>
          <div className="d-flex align-item-center">
            <HiddenAltImage
              title="Icon"
              src={organization.iconUrl}
              width="2.5rem"
              height="2.5rem"
              style={organization.iconUrl ? { marginRight: '1rem' } : {}}
            />
            <h3 style={{ display: 'inline' }}>{organization.name}</h3>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          {locations.length > 0 ? (
            <ListGroup
              style={{
                display: 'grid',
                columnGap: '0.5rem',
                rowGap: '0.5rem',
                gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))',
              }}
            >
              <ScheduleLocationsList locations={locations} />
            </ListGroup>
          ) : (
            <ScheduleEmpty
              organizationId={organization.id}
              manageMessage="This organization currently has no locations. You can create locations from the Manage console."
              manageLink={`/manage/organizations/${organization.id}/desks`}
              standardMessage="Your administrator has not created any locations for this organization."
            />
          )}
        </td>
      </tr>
    </>
  )
}

export default ScheduleOrganizationsListItem
