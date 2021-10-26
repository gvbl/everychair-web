import CSS from 'csstype'
import React from 'react'
import { Button } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { LinkContainer } from 'react-router-bootstrap'
import { useLocation, useParams } from 'react-router-dom'
import { PlanToLocationsQuotaMap } from '../../models/api/PlanInfo'
import { OrganizationParams } from '../../models/OrganizationParams'
import { RootState } from '../../store'

interface AddLocationButtonProps {
  style?: CSS.Properties
}

const AddLocationButton = ({ style }: AddLocationButtonProps) => {
  const { organizationId } = useParams<OrganizationParams>()
  const urlLocation = useLocation()

  const isBelowQuota = useSelector<RootState, boolean>((state) => {
    const numLocations = Object.values(state.locations.entity).filter(
      (location) => location.organizationId === organizationId
    ).length
    const plan = state.memberships.entity[organizationId]?.organization.plan
    const quota = PlanToLocationsQuotaMap[plan]
    return numLocations < quota
  })

  return (
    <LinkContainer
      to={
        isBelowQuota
          ? `${urlLocation.pathname}/add-location`
          : `${urlLocation.pathname}/add-location-upgrade`
      }
      style={style}
    >
      <Button>Add location</Button>
    </LinkContainer>
  )
}

export default AddLocationButton
