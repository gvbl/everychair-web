import React, { useEffect, useRef } from 'react'
import { Container } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect, Route, Switch } from 'react-router-dom'
import { AppDispatch } from '../..'
import RelativeSpinner from '../../components/RelativeSpinner'
import StopError from '../../components/StopError'
import Organization from '../../models/api/Organization'
import Location from '../../models/api/Location'
import { isLoading, Loading } from '../../models/Loading'
import { RootState } from '../../store'
import { fetchLocations } from '../desks/locationsSlice'
import ScheduleDetail from './ScheduleDetail'
import ScheduleOrganizationsList from './ScheduleOrganizationsList'

interface ScheduleMainProps {
  organizations: Organization[]
}

const ScheduleMain = ({ organizations }: ScheduleMainProps) => {
  return (
    <div className="h-100" style={{ overflowY: 'auto' }}>
      <Container style={{ padding: '0' }}>
        <ScheduleOrganizationsList organizations={organizations} />
      </Container>
    </div>
  )
}

interface SchedulePageSelected {
  organizations: Organization[]
  locations: Location[]
  locationsLoading: Loading
}

const SchedulePage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const organizationIds = useRef<string[]>([])

  const { organizations, locations, locationsLoading } = useSelector<
    RootState,
    SchedulePageSelected
  >((state) => {
    organizationIds.current = Object.keys(state.memberships.entity)
    return {
      organizations: Object.values(state.memberships.entity).map(
        (membership) => membership.organization
      ),
      locations: Object.values(state.locations.entity),
      locationsLoading: state.locations.loading,
    }
  })

  useEffect(() => {
    dispatch(fetchLocations(organizationIds.current))
  }, [organizationIds, dispatch])

  if (isLoading(locationsLoading)) {
    return <RelativeSpinner />
  }

  if (locationsLoading === Loading.FAILED) {
    return <StopError />
  }

  const firstOrganizationLocations = locations.filter(
    (location) => location.organizationId === organizations[0].id
  )

  return (
    <Switch>
      <Route exact path="/schedule">
        {organizations.length === 1 &&
        firstOrganizationLocations.length === 1 ? (
          <Redirect
            to={`/schedule/organizations/${organizations[0].id}/locations/${firstOrganizationLocations[0].id}`}
          />
        ) : (
          <ScheduleMain organizations={organizations} />
        )}
      </Route>
      <Route path="/schedule/organizations/:organizationId/locations/:locationId">
        <ScheduleDetail />
      </Route>
    </Switch>
  )
}

export default SchedulePage
