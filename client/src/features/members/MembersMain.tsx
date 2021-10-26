import React, { useEffect, useRef } from 'react'
import { ListGroup } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import RelativeSpinner from '../../components/RelativeSpinner'
import StopError from '../../components/StopError'
import Invitation from '../../models/api/Invitation'
import Member from '../../models/api/Member'
import { Role } from '../../models/api/Role'
import { isLoading, Loading } from '../../models/Loading'
import { isSmallScreen } from '../../models/mediaQueries'
import { OrganizationParams } from '../../models/OrganizationParams'
import { reviveInvitations } from '../../models/revive'
import { RootState } from '../../store'
import InvitationList from './InvitationList'
import { fetchInvitations } from './invitationsSlice'
import InviteButton from './InviteButton'
import MemberList from './MemberList'
import { fetchMembers } from './membersSlice'

interface MembersMainSelected {
  membersLoading: Loading
  members: Member[]
  invitationsLoading: Loading
  invitations: Invitation[]
}

const MembersMain = () => {
  const { organizationId } = useParams<OrganizationParams>()
  const dispatch = useDispatch<AppDispatch>()
  const organizationIds = useRef<string[]>([])
  const adminOrganizationIds = useRef<string[]>([])

  const {
    membersLoading,
    members,
    invitationsLoading,
    invitations,
  } = useSelector<RootState, MembersMainSelected>((state) => {
    organizationIds.current = Object.keys(state.memberships.entity)
    adminOrganizationIds.current = Object.values(state.memberships.entity)
      .filter((membership) => membership.roles.includes(Role.ADMIN))
      .map((membership) => membership.organization.id)
    return {
      membersLoading: state.members.loading,
      members: Object.values(state.members.entity).filter(
        (member) => member.organizationId === organizationId
      ),
      invitationsLoading: state.invitations.loading,
      invitations: reviveInvitations(
        Object.values(state.invitations.entity)
      ).filter((invitation) => invitation.organizationId === organizationId),
    }
  })

  useEffect(() => {
    dispatch(fetchMembers(organizationIds.current))
    dispatch(fetchInvitations(adminOrganizationIds.current))
  }, [organizationIds, adminOrganizationIds, dispatch])

  if (isLoading(membersLoading) || isLoading(invitationsLoading)) {
    return <RelativeSpinner />
  }
  if (
    membersLoading === Loading.FAILED ||
    invitationsLoading === Loading.FAILED
  ) {
    return <StopError />
  }
  return (
    <>
      <ListGroup
        className="h-100 flex-fill"
        style={{ padding: '0.5rem', overflowY: 'auto' }}
      >
        <MemberList members={members} />
        {invitations.length > 0 && (
          <ListGroup.Item as="li" variant="secondary" key="invitations-header">
            Invitations
          </ListGroup.Item>
        )}
        <InvitationList invitations={invitations} />
      </ListGroup>
      {isSmallScreen() && <InviteButton />}
    </>
  )
}

export default MembersMain
