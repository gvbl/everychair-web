import { capitalize } from 'lodash'
import React, { useEffect, useRef } from 'react'
import { Button, Table } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useHistory, useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import LoadingModal from '../../components/LoadingModal'
import GenericModal from '../../components/modals/GenericModal'
import useModalParentPath from '../../hooks/UseModalParentPath'
import Organization from '../../models/api/Organization'
import { Plan } from '../../models/api/Plan'
import {
  PlanToDesksQuotaMap,
  PlanToLocationsQuotaMap,
  PlanToMembersQuotaMap,
  PlanToSpacesQuotaMap,
} from '../../models/api/PlanInfo'
import { Role } from '../../models/api/Role'
import { isLoading, Loading } from '../../models/Loading'
import { OrganizationParams } from '../../models/OrganizationParams'
import { RootState } from '../../store'
import { useQuery } from '../../util/query'
import { fetchDesks } from '../desks/desksSlice'
import { fetchLocations } from '../desks/locationsSlice'
import { fetchSpaces } from '../desks/spacesSlice'
import { fetchInvitations } from '../members/invitationsSlice'
import { fetchMembers } from '../members/membersSlice'

interface MeetQuotaModalSelected {
  organizationName: string
  freeOrganizations: Organization[]
  membersAndInvitationsCount: number
  locationsCount: number
  spacesCount: number
  desksCount: number
  locationsLoading: Loading
  spacesLoading: Loading
  desksLoading: Loading
  membersLoading: Loading
  invitationsLoading: Loading
}

const MeetQuotaModal = () => {
  const { organizationId } = useParams<OrganizationParams>()
  const planQueryParam = useQuery().get('plan')
  const history = useHistory()
  const dispatch = useDispatch<AppDispatch>()
  const modalParentPath = useModalParentPath()
  const adminOrganizationIds = useRef<string[]>([])

  const {
    organizationName,
    freeOrganizations,
    membersAndInvitationsCount,
    locationsCount,
    spacesCount,
    desksCount,
    locationsLoading,
    spacesLoading,
    desksLoading,
    membersLoading,
    invitationsLoading,
  } = useSelector<RootState, MeetQuotaModalSelected>((state) => {
    adminOrganizationIds.current = Object.values(state.memberships.entity)
      .filter((membership) => membership.roles.includes(Role.ADMIN))
      .map((membership) => membership.organization.id)
    return {
      organizationName:
        state.memberships.entity[organizationId].organization.name,
      freeOrganizations: Object.values(state.memberships.entity)
        .filter((membership) => membership.organization.plan === Plan.FREE)
        .map((membership) => membership.organization),
      membersAndInvitationsCount:
        Object.values(state.members.entity).filter(
          (member) => member.organizationId === organizationId
        ).length +
        Object.values(state.invitations.entity).filter(
          (invitation) => invitation.organizationId === organizationId
        ).length,
      locationsCount: Object.values(state.locations.entity).filter(
        (location) => location.organizationId === organizationId
      ).length,
      spacesCount: Object.values(state.spaces.entity).filter(
        (space) => space.organizationId === organizationId
      ).length,
      desksCount: Object.values(state.desks.entity).filter(
        (desk) => desk.organizationId === organizationId
      ).length,
      locationsLoading: state.locations.loading,
      spacesLoading: state.spaces.loading,
      desksLoading: state.desks.loading,
      membersLoading: state.members.loading,
      invitationsLoading: state.invitations.loading,
    }
  })

  useEffect(() => {
    dispatch(fetchLocations(adminOrganizationIds.current))
    dispatch(fetchSpaces(adminOrganizationIds.current))
    dispatch(fetchDesks(adminOrganizationIds.current))
    dispatch(fetchMembers(adminOrganizationIds.current))
    dispatch(fetchInvitations(adminOrganizationIds.current))
  }, [adminOrganizationIds, dispatch])

  if (!planQueryParam) {
    return null
  }

  const plan = Plan[planQueryParam as keyof typeof Plan]

  if (
    isLoading(locationsLoading) ||
    isLoading(spacesLoading) ||
    isLoading(desksLoading) ||
    isLoading(membersLoading) ||
    isLoading(invitationsLoading)
  ) {
    return <LoadingModal title="Change plan" />
  }

  if (
    locationsLoading === Loading.FAILED ||
    spacesLoading === Loading.FAILED ||
    desksLoading === Loading.FAILED ||
    membersLoading === Loading.FAILED ||
    invitationsLoading === Loading.FAILED
  ) {
    return <LoadingModal title="Change plan" error />
  }

  return (
    <GenericModal
      title="Change plan"
      footer={
        <Button
          variant="secondary"
          onClick={() => history.replace(modalParentPath)}
        >
          Close
        </Button>
      }
      show
    >
      {freeOrganizations.length > 0 ? (
        <>
          Your organization ${freeOrganizations[0].name} is currently subscribed
          to the Free plan. Each account is limited to one free organization.
        </>
      ) : (
        <>
          Your organization {organizationName} currently exceeds the resource
          limits for the {capitalize(planQueryParam)} plan. You may use the{' '}
          <Link to={`/manage/organizations/${organizationId}/members`}>
            manage console
          </Link>{' '}
          to remove them, see below for details.
          <Table className="table-borderless">
            <tbody>
              <tr>
                <td></td>
                <td>
                  <b>{capitalize(planQueryParam)}</b>
                </td>
                <td>Current</td>
              </tr>
              <tr>
                <td>Members</td>
                <td>{PlanToMembersQuotaMap[plan]}</td>
                <td>
                  <span
                    style={
                      membersAndInvitationsCount > PlanToMembersQuotaMap[plan]
                        ? { color: 'red' }
                        : {}
                    }
                  >
                    {membersAndInvitationsCount}
                  </span>
                </td>
              </tr>
              <tr>
                <td>Locations</td>
                <td>{PlanToLocationsQuotaMap[plan]}</td>
                <td>
                  <span
                    style={
                      locationsCount > PlanToLocationsQuotaMap[plan]
                        ? { color: 'red' }
                        : {}
                    }
                  >
                    {locationsCount}
                  </span>
                </td>
              </tr>
              <tr>
                <td>Spaces</td>
                <td>{PlanToSpacesQuotaMap[plan]}</td>
                <td>
                  <span
                    style={
                      spacesCount > PlanToSpacesQuotaMap[plan]
                        ? { color: 'red' }
                        : {}
                    }
                  >
                    {spacesCount}
                  </span>
                </td>
              </tr>
              <tr>
                <td>Desks</td>
                <td>{PlanToDesksQuotaMap[plan]}</td>
                <td>
                  <span
                    style={
                      desksCount > PlanToDesksQuotaMap[plan]
                        ? { color: 'red' }
                        : {}
                    }
                  >
                    {desksCount}
                  </span>
                </td>
              </tr>
            </tbody>
          </Table>
          <i>Members and invitations both count towards total members.</i>
        </>
      )}
    </GenericModal>
  )
}

export default MeetQuotaModal
