import React from 'react'
import { ListGroup } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import Desk from '../../models/api/Desk'
import Space from '../../models/api/Space'
import { ScheduleParams } from '../../models/ScheduleParams'
import { RootState } from '../../store'
import ScheduleDesksList from './ScheduleDesksList'
import ScheduleEmpty from './ScheduleEmpty'

interface ScheduleSpacesListItemProps {
  space: Space
  date: Date
  onReserve: (deskId: string) => void
}

const ScheduleSpacesListItem = ({
  space,
  date,
  onReserve,
}: ScheduleSpacesListItemProps) => {
  const { organizationId, locationId } = useParams<ScheduleParams>()

  const desks = useSelector<RootState, Desk[]>((state) =>
    Object.values(state.desks.entity).filter(
      (desk) => desk.spaceId === space.id
    )
  )
  return (
    <>
      <tr>
        <td>
          <h3>{space.name}</h3>
        </td>
      </tr>
      <tr>
        <td>
          {desks.length > 0 ? (
            <ListGroup
              style={{
                display: 'grid',
                justifyItems: 'center',
                columnGap: '0.5rem',
                rowGap: '0.5rem',
                gridTemplateColumns: 'repeat(auto-fill, minmax(21rem, 1fr))',
              }}
            >
              <ScheduleDesksList
                desks={desks}
                date={date}
                onReserve={onReserve}
              />
            </ListGroup>
          ) : (
            <ScheduleEmpty
              organizationId={organizationId}
              manageMessage="This space currently has no desks. You can create desks from the Manage console."
              manageLink={`/manage/organizations/${organizationId}/desks/locations/${locationId}/spaces/${space.id}`}
              standardMessage="Your administrator has not created any desks for this space."
            />
          )}
        </td>
      </tr>
    </>
  )
}

export default ScheduleSpacesListItem
