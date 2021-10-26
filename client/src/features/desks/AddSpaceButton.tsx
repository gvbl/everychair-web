import React from 'react'
import { Button } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { LinkContainer } from 'react-router-bootstrap'
import { useLocation, useParams } from 'react-router-dom'
import { PlanToSpacesQuotaMap } from '../../models/api/PlanInfo'
import { OrganizationParams } from '../../models/OrganizationParams'
import { RootState } from '../../store'

const AddSpaceButton = () => {
  const { organizationId } = useParams<OrganizationParams>()
  const urlLocation = useLocation()

  const isBelowQuota = useSelector<RootState, boolean>((state) => {
    const numSpaces = Object.values(state.spaces.entity).filter(
      (space) => space.organizationId === organizationId
    ).length
    const plan = state.memberships.entity[organizationId]?.organization.plan
    const quota = PlanToSpacesQuotaMap[plan]
    return numSpaces < quota
  })

  return (
    <LinkContainer
      to={
        isBelowQuota
          ? `${urlLocation.pathname}/add-space`
          : `${urlLocation.pathname}/add-space-upgrade`
      }
      style={{
        position: 'absolute',
        right: '2rem',
        bottom: '2rem',
        zIndex: 10,
      }}
    >
      <Button>Add space</Button>
    </LinkContainer>
  )
}

export default AddSpaceButton
