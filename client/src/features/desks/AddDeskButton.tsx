import React from 'react'
import { Button } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { LinkContainer } from 'react-router-bootstrap'
import { useLocation, useParams } from 'react-router-dom'
import { PlanToDesksQuotaMap } from '../../models/api/PlanInfo'
import { OrganizationParams } from '../../models/OrganizationParams'
import { RootState } from '../../store'

const AddDeskButton = () => {
  const { organizationId } = useParams<OrganizationParams>()
  const urlLocation = useLocation()

  const isBelowQuota = useSelector<RootState, boolean>((state) => {
    const numDesks = Object.values(state.desks.entity).filter(
      (desk) => desk.organizationId === organizationId
    ).length
    const plan = state.memberships.entity[organizationId]?.organization.plan
    const quota = PlanToDesksQuotaMap[plan]
    return numDesks < quota
  })

  return (
    <LinkContainer
      to={
        isBelowQuota
          ? `${urlLocation.pathname}/add-desk`
          : `${urlLocation.pathname}/add-desk-upgrade`
      }
      style={{
        position: 'absolute',
        right: '2rem',
        bottom: '2rem',
        zIndex: 10,
      }}
    >
      <Button>Add desk</Button>
    </LinkContainer>
  )
}

export default AddDeskButton
