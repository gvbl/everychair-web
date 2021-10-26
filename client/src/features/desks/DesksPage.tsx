import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect, Route, Switch, useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import RelativeSpinner from '../../components/RelativeSpinner'
import DetailContainer from '../../components/DetailContainer'
import MainContainer from '../../components/MainContainer'
import MainDetail from '../../components/MainDetail'
import StopError from '../../components/StopError'
import Location from '../../models/api/Location'
import Space from '../../models/api/Space'
import { Loading, isLoading } from '../../models/Loading'
import { OrganizationParams } from '../../models/OrganizationParams'
import { RootState } from '../../store'
import DesksDefault from './DesksDefault'
import DesksMain from './DesksMain'
import { fetchDesks } from './desksSlice'
import LocationDetail from './LocationDetail'
import LocationsEmpty from './LocationsEmpty'
import { fetchLocations } from './locationsSlice'
import SpaceDetail from './SpaceDetail'
import { fetchSpaces } from './spacesSlice'

interface DesksPageSelected {
  locationsLoading: Loading
  locations: Location[]
  spacesLoading: Loading
  spaces: Space[]
  desksLoading: Loading
}

const DesksPage = () => {
  const { organizationId } = useParams<OrganizationParams>()
  const dispatch = useDispatch<AppDispatch>()
  const organizationIds = useRef<string[]>([])

  const {
    locationsLoading,
    locations,
    spacesLoading,
    spaces,
    desksLoading,
  } = useSelector<RootState, DesksPageSelected>((state) => {
    organizationIds.current = Object.keys(state.memberships.entity)
    return {
      locationsLoading: state.locations.loading,
      locations: Object.values(state.locations.entity).filter(
        (location) => location.organizationId === organizationId
      ),
      spacesLoading: state.spaces.loading,
      spaces: Object.values(state.spaces.entity).filter(
        (spaces) => spaces.organizationId === organizationId
      ),
      desksLoading: state.desks.loading,
    }
  })

  useEffect(() => {
    dispatch(fetchLocations(organizationIds.current))
    dispatch(fetchSpaces(organizationIds.current))
    dispatch(fetchDesks(organizationIds.current))
  }, [organizationIds, dispatch])

  if (
    isLoading(locationsLoading) ||
    isLoading(spacesLoading) ||
    isLoading(desksLoading)
  ) {
    return <RelativeSpinner />
  }
  if (
    locationsLoading === Loading.FAILED ||
    spacesLoading === Loading.FAILED ||
    desksLoading === Loading.FAILED
  ) {
    return <StopError />
  }
  let locationsSpacesPath = `/manage/organizations/${organizationId}/desks`
  if (locations.length > 0) {
    locationsSpacesPath += `/locations/${locations[0].id}`
  }
  if (spaces.length > 0) {
    locationsSpacesPath += `/spaces/${spaces[0].id}`
  }
  return (
    <>
      {locations.length > 0 ? (
        <>
          <MainDetail>
            <MainContainer>
              <DesksMain />
            </MainContainer>
            <DetailContainer>
              <Switch>
                <Route exact path="/manage/organizations/:organizationId/desks">
                  {locations.length > 0 || spaces.length > 0 ? (
                    <Redirect to={locationsSpacesPath} />
                  ) : (
                    <DesksDefault />
                  )}
                </Route>
                <Route
                  path="/manage/organizations/:organizationId/desks/locations/:locationId/spaces/:spaceId"
                  component={SpaceDetail}
                />
                <Route
                  path="/manage/organizations/:organizationId/desks/locations/:locationId"
                  component={LocationDetail}
                />
              </Switch>
            </DetailContainer>
          </MainDetail>
        </>
      ) : (
        <LocationsEmpty />
      )}
    </>
  )
}

export default DesksPage
