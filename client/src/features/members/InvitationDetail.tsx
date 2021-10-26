import React, { useEffect, useRef } from 'react'
import { Button, Container, Table } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { LinkContainer } from 'react-router-bootstrap'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import RelativeSpinner from '../../components/RelativeSpinner'
import StopError from '../../components/StopError'
import Invitation from '../../models/api/Invitation'
import { Role } from '../../models/api/Role'
import { InvitationParams } from '../../models/InvitationParams'
import { isLoading, Loading } from '../../models/Loading'
import { reviveInvitation } from '../../models/revive'
import { RootState } from '../../store'
import { now } from '../../util/date'
import { fetchInvitations } from './invitationsSlice'

interface InvitationDetailInnerProps {
  invitation: Invitation
}

const InvitationDetailInner = ({ invitation }: InvitationDetailInnerProps) => {
  const urlLocation = useLocation()

  if (!invitation) {
    return null
  }

  const expired = invitation.expiration.getTime() < now().getTime()

  return (
    <div className="h-100 w-100" style={{ overflowY: 'auto' }}>
      <Container style={{ padding: '0' }}>
        <Table className="table-borderless">
          <tbody>
            <tr>
              <td>An invitation has been sent to {invitation.email}.</td>
            </tr>
            <tr>
              <td className="first-column">
                <b>Expiration</b>
                <p>
                  {new Intl.DateTimeFormat('en-US').format(
                    invitation.expiration
                  )}
                  {expired && (
                    <span style={{ color: 'red', marginLeft: '0.5rem' }}>
                      (Expired)
                    </span>
                  )}
                </p>
              </td>
            </tr>
            <tr>
              <td className="text-center">
                <LinkContainer to={`${urlLocation.pathname}/cancel-invite`}>
                  <Button variant="danger">Cancel invitation</Button>
                </LinkContainer>
              </td>
            </tr>
          </tbody>
        </Table>
      </Container>
    </div>
  )
}

interface InvitationSelected {
  invitationsLoading: Loading
  invitation?: Invitation
}

const InvitationDetail = () => {
  const { organizationId, invitationId } = useParams<InvitationParams>()
  const history = useHistory()
  const dispatch = useDispatch<AppDispatch>()
  const adminOrganizationIds = useRef<string[]>([])

  const { invitationsLoading, invitation } = useSelector<
    RootState,
    InvitationSelected
  >((state) => {
    adminOrganizationIds.current = Object.values(state.memberships.entity)
      .filter((membership) => membership.roles.includes(Role.ADMIN))
      .map((membership) => membership.organization.id)
    return {
      invitationsLoading: state.invitations.loading,
      invitation:
        invitationId && state.invitations.entity[invitationId]
          ? reviveInvitation(state.invitations.entity[invitationId])
          : undefined,
    }
  })

  useEffect(() => {
    dispatch(fetchInvitations(adminOrganizationIds.current))
  }, [adminOrganizationIds, dispatch])

  if (isLoading(invitationsLoading)) {
    return <RelativeSpinner />
  }

  if (invitationsLoading === Loading.FAILED) {
    return <StopError />
  }

  if (!invitation) {
    history.push(`/manage/organizations/${organizationId}/members`)
    return null
  }

  return <InvitationDetailInner invitation={invitation} />
}

export default InvitationDetail
