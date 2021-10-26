import React from 'react'
import { Button } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { LinkContainer } from 'react-router-bootstrap'
import { useLocation, useParams } from 'react-router-dom'
import { PlanToMembersQuotaMap } from '../../models/api/PlanInfo'
import { OrganizationParams } from '../../models/OrganizationParams'
import { RootState } from '../../store'

interface InviteButtonSelected {
  emailConfirmed: boolean
  isBelowQuota: boolean
}

const InviteButton = () => {
  const { organizationId } = useParams<OrganizationParams>()
  const urlLocation = useLocation()

  const emailConfirmed = useSelector<RootState, boolean>(
    (state) => !!state.user.entity?.emailConfirmed
  )

  const isBelowQuota = useSelector<RootState, InviteButtonSelected>((state) => {
    const invitationsCount = Object.values(state.invitations.entity).filter(
      (invitation) => invitation.organizationId === organizationId
    ).length
    const membersCount = Object.values(state.members.entity).filter(
      (member) => member.organizationId === organizationId
    ).length
    const plan = state.memberships.entity[organizationId]?.organization.plan
    const quota = PlanToMembersQuotaMap[plan]
    return {
      emailConfirmed: !!state.user.entity?.emailConfirmed,
      isBelowQuota: invitationsCount + membersCount < quota,
    }
  })

  const activeLink = () => {
    if (!emailConfirmed) {
      return `${urlLocation.pathname}/email-confirmation`
    }
    if (isBelowQuota) {
      return `${urlLocation.pathname}/invite`
    }
    return `${urlLocation.pathname}/invite-upgrade`
  }

  return (
    <>
      <LinkContainer
        style={{
          position: 'absolute',
          right: '2rem',
          bottom: '2rem',
          zIndex: 10,
        }}
        to={activeLink()}
      >
        <Button>Invite</Button>
      </LinkContainer>
    </>
  )
}

export default InviteButton
