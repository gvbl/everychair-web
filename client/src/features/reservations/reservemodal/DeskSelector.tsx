import React, { useState } from 'react'
import { Breadcrumb, Card, Form, Tab } from 'react-bootstrap'
import Desk from '../../../models/api/Desk'
import Location from '../../../models/api/Location'
import Organization from '../../../models/api/Organization'
import Space from '../../../models/api/Space'
import { autoForward } from '../util'
import ReserveDesksList from './ReserveDesksList'
import ReserveLocationsList from './ReserveLocationsList'
import ReserveOrganizationsList from './ReserveOrganizationsList'
import ReserveSpacesList from './ReserveSpacesList'

export interface DeskSelectorIds {
  organizationId?: string
  locationId?: string
  spaceId?: string
  deskId?: string
}

interface DeskSelectorProps {
  onChange: (ids: DeskSelectorIds) => void
  organizationsMap: Record<string, Organization>
  locationsMap: Record<string, Location>
  spacesMap: Record<string, Space>
  desksMap: Record<string, Desk>
  deskConflictMap: Record<string, boolean>
  value: DeskSelectorIds
  error?: string
}

const DeskSelector = ({
  onChange,
  organizationsMap,
  locationsMap,
  spacesMap,
  desksMap,
  deskConflictMap,
  value,
  error,
}: DeskSelectorProps) => {
  const forwardKey = (ids: DeskSelectorIds) => {
    let key = 'desk'
    if (!ids.spaceId) {
      key = 'space'
    }
    if (!ids.locationId) {
      key = 'location'
    }
    if (!ids.organizationId) {
      key = 'organization'
    }
    return key
  }

  const [key, setKey] = useState<string>(forwardKey(value))

  const organizations = Object.values(organizationsMap)
  const locations = Object.values(locationsMap)
  const spaces = Object.values(spacesMap)
  const desks = Object.values(desksMap)

  return (
    <>
      <Breadcrumb
        hidden={
          !value.organizationId ||
          (organizations.length === 1 &&
            locations.length === 1 &&
            spaces.length === 1)
        }
        listProps={{
          style: {
            flexWrap: 'nowrap',
            whiteSpace: 'nowrap',
            overflowX: 'auto',
          },
        }}
      >
        <Breadcrumb.Item
          onClick={() => {
            onChange({})
            setKey('organization')
          }}
        >
          {value.organizationId && organizationsMap[value.organizationId].name}
        </Breadcrumb.Item>
        <Breadcrumb.Item
          hidden={!value.locationId}
          onClick={() => {
            onChange({
              ...value,
              locationId: undefined,
              spaceId: undefined,
              deskId: undefined,
            })
            setKey('location')
          }}
        >
          {value.locationId && locationsMap[value.locationId].name}
        </Breadcrumb.Item>
        <Breadcrumb.Item
          hidden={!value.spaceId}
          onClick={() => {
            onChange({
              ...value,
              spaceId: undefined,
              deskId: undefined,
            })
            setKey('space')
          }}
        >
          {value.spaceId && spacesMap[value.spaceId].name}
        </Breadcrumb.Item>
      </Breadcrumb>
      <Form.Label>
        <span style={{ textTransform: 'capitalize' }}>{key}</span>
      </Form.Label>
      <Card
        style={{ padding: '0.5rem 0', height: 'unset' }}
        className={!!error ? 'form-control is-invalid' : undefined}
      >
        <Tab.Container activeKey={key} transition={false}>
          <Tab.Content>
            <Tab.Pane eventKey="organization">
              <ReserveOrganizationsList
                organizations={organizations}
                desks={desks}
                onOrganizationSelected={(organizationId: string) => {
                  const ids = { organizationId: organizationId }
                  const forwarded = autoForward(
                    ids,
                    organizations,
                    locations,
                    spaces,
                    desks
                  )
                  setKey(forwardKey(ids))
                  onChange(forwarded)
                }}
              />
            </Tab.Pane>
            <Tab.Pane eventKey="location">
              <ReserveLocationsList
                locations={locations.filter(
                  (location) => location.organizationId === value.organizationId
                )}
                desks={desks}
                onLocationSelected={(locationId: string) => {
                  const ids = {
                    ...value,
                    locationId: locationId,
                  }
                  const forwarded = autoForward(
                    ids,
                    organizations,
                    locations,
                    spaces,
                    desks
                  )
                  setKey(forwardKey(ids))
                  onChange(forwarded)
                }}
              />
            </Tab.Pane>
            <Tab.Pane eventKey="space">
              <ReserveSpacesList
                spaces={spaces.filter(
                  (space) => space.locationId === value.locationId
                )}
                desks={desks}
                onSpaceSelected={(spaceId: string) => {
                  const ids = {
                    ...value,
                    spaceId: spaceId,
                  }
                  const forwarded = autoForward(
                    ids,
                    organizations,
                    locations,
                    spaces,
                    desks
                  )
                  setKey(forwardKey(ids))
                  onChange(forwarded)
                }}
              />
            </Tab.Pane>
            <Tab.Pane eventKey="desk">
              <ReserveDesksList
                desks={desks.filter((desk) => desk.spaceId === value.spaceId)}
                deskConflictMap={deskConflictMap}
                onDeskSelected={(deskId?: string) => {
                  onChange({
                    ...value,
                    deskId: deskId,
                  })
                }}
                selectedId={value.deskId}
              />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Card>
      <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
    </>
  )
}

export default DeskSelector
