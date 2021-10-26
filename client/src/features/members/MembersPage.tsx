import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect, Route, Switch, useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import RelativeSpinner from '../../components/RelativeSpinner'
import DetailContainer from '../../components/DetailContainer'
import MainContainer from '../../components/MainContainer'
import MainDetail from '../../components/MainDetail'
import StopError from '../../components/StopError'
import Member from '../../models/api/Member'
import { Role } from '../../models/api/Role'
import { isLoading, Loading } from '../../models/Loading'
import { OrganizationParams } from '../../models/OrganizationParams'
import { RootState } from '../../store'
import InvitationDetail from './InvitationDetail'
import { fetchInvitations } from './invitationsSlice'
import InviteButton from './InviteButton'
import MemberDetail from './MemberDetail'
import MembersDefault from './MembersDefault'
import MembersMain from './MembersMain'
import { fetchMembers } from './membersSlice'

interface MembersPageSelected {
  membersLoading: Loading
  members: Member[]
  invitationsLoading: Loading
}

const MembersPage = () => {
  const { organizationId } = useParams<OrganizationParams>()
  const dispatch = useDispatch<AppDispatch>()
  const organizationIds = useRef<string[]>([])
  const adminOrganizationIds = useRef<string[]>([])

  const { membersLoading, members, invitationsLoading } = useSelector<
    RootState,
    MembersPageSelected
  >((state) => {
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
      <MainDetail>
        <MainContainer>
          <MembersMain />
        </MainContainer>
        <DetailContainer>
          <Switch>
            <Route exact path="/manage/organizations/:organizationId/members">
              {members.length > 0 ? (
                <Redirect
                  to={`/manage/organizations/${organizationId}/members/${members[0].membershipId}`}
                />
              ) : (
                <MembersDefault />
              )}
            </Route>
            <Route
              path="/manage/organizations/:organizationId/members/invitations/:invitationId"
              component={InvitationDetail}
            />
            <Route
              path="/manage/organizations/:organizationId/members/:membershipId"
              component={MemberDetail}
            />
          </Switch>
        </DetailContainer>
      </MainDetail>
      <InviteButton />
    </>
  )
}

export default MembersPage
