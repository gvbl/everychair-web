import _ from 'lodash'
import React, { useRef } from 'react'
import { Alert, Nav, Navbar, NavbarBrand } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { LinkContainer } from 'react-router-bootstrap'
import {
  generatePath,
  matchPath,
  useHistory,
  useLocation,
  useParams,
} from 'react-router-dom'
import { AppDispatch } from '../..'
import HiddenAltImage from '../../components/HiddenAltImage'
import Organization from '../../models/api/Organization'
import { Role } from '../../models/api/Role'
import { SubscriptionStatus } from '../../models/api/SubscriptionStatus'
import { OrganizationParams } from '../../models/OrganizationParams'
import { RootState } from '../../store'
import { updateDesks } from '../desks/desksSlice'
import { updateLocations } from '../desks/locationsSlice'
import { updateSpaces } from '../desks/spacesSlice'
import { updateInvitations } from '../members/invitationsSlice'
import { updateMembers } from '../members/membersSlice'
import ManageOrganizationsDropdown from './ManageOrganizationsDropdown'

interface ManageNavProps {
  manageOrganizations: Organization[]
}

interface ManageNavSelected {
  isOwner: boolean
  paymentFailedNames: string[]
}

const ManageNav = ({ manageOrganizations }: ManageNavProps) => {
  const { organizationId } = useParams<OrganizationParams>()
  const history = useHistory()
  const dispatch = useDispatch<AppDispatch>()
  const urlLocation = useLocation()
  const organizationIds = useRef<string[]>([])
  const adminOrganizationIds = useRef<string[]>([])

  const { isOwner, paymentFailedNames } = useSelector<
    RootState,
    ManageNavSelected
  >((state) => {
    organizationIds.current = Object.keys(state.memberships.entity)
    adminOrganizationIds.current = Object.values(state.memberships.entity)
      .filter((membership) => membership.roles.includes(Role.ADMIN))
      .map((membership) => membership.organization.id)
    return {
      isOwner: state.memberships.entity[organizationId]?.roles.includes(
        Role.OWNER
      ),
      paymentFailedNames: Object.values(state.memberships.entity)
        .map((membership) => membership.organization)
        .filter(
          (organization) =>
            organization.subscription?.status ===
            SubscriptionStatus.PAYMENT_FAILED
        )
        .map((organization) => organization.name),
    }
  })

  const manageOrganizationsMap = _.mapKeys<Organization>(
    manageOrganizations,
    'id'
  )

  return (
    <>
      <Navbar collapseOnSelect expand="sm" bg="primary" variant="dark">
        <NavbarBrand>
          {manageOrganizations.length === 1 ? (
            <div
              className="d-flex align-items-center"
              style={{
                borderRadius: '0.25rem',
                backgroundColor: '#f8f9fa',
                border: '1px solid transparent',
                borderColor: '#f8f9fa',
                padding: '0.25rem 0.5rem',
              }}
            >
              <HiddenAltImage
                title="Organization Icon"
                src={manageOrganizations[0].iconUrl}
                width="1.8rem"
                height="1.8rem"
                style={
                  manageOrganizations[0].iconUrl ? { marginRight: '1rem' } : {}
                }
              />
              <span style={{ fontSize: '1.25rem', color: '#212529' }}>
                {manageOrganizations[0].name}
              </span>
            </div>
          ) : (
            <ManageOrganizationsDropdown
              manageOrganizationsMap={manageOrganizationsMap}
              onSelect={async (selectedOrganizationId) => {
                const matchMembers = matchPath(urlLocation.pathname, {
                  path: '/manage/organizations/:organizationId/members',
                })
                const matchDesks = matchPath(urlLocation.pathname, {
                  path: '/manage/organizations/:organizationId/desks',
                })
                const matchOwner = matchPath(urlLocation.pathname, {
                  path: '/manage/organizations/:organizationId/organization',
                })
                let path
                if (matchMembers) {
                  path = matchMembers.path
                } else if (matchDesks) {
                  path = matchDesks.path
                } else if (matchOwner) {
                  path = matchOwner.path
                }
                if (path) {
                  history.push(
                    generatePath(path, {
                      organizationId: selectedOrganizationId,
                    })
                  )
                }
              }}
              selectedId={organizationId}
            />
          )}
        </NavbarBrand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav>
            <LinkContainer
              to={`/manage/organizations/${organizationId}/members`}
              onClick={() => {
                dispatch(updateMembers(organizationIds.current))
                dispatch(updateInvitations(adminOrganizationIds.current))
              }}
            >
              <Nav.Link active={false}>Members</Nav.Link>
            </LinkContainer>
            <LinkContainer
              to={`/manage/organizations/${organizationId}/desks`}
              onClick={() => {
                dispatch(updateLocations(organizationIds.current))
                dispatch(updateSpaces(organizationIds.current))
                dispatch(updateDesks(organizationIds.current))
              }}
            >
              <Nav.Link active={false}>Desks</Nav.Link>
            </LinkContainer>
            {isOwner && (
              <LinkContainer
                to={`/manage/organizations/${organizationId}/organization`}
              >
                <Nav.Link active={false}>Organization</Nav.Link>
              </LinkContainer>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      {isOwner && paymentFailedNames.length > 0 && (
        <Alert variant="warning">
          <Alert.Heading>Payment failed</Alert.Heading>
          {paymentFailedNames.length === 1 ? (
            <p>
              A subscription payment for {paymentFailedNames[0]} has failed.
              Please visit the Manage Billing link to resolve.
            </p>
          ) : (
            <p>
              Subscription payments for multiple organizations have failed.
              Please visit the Manage Billing link for each one to resolve.
            </p>
          )}
        </Alert>
      )}
    </>
  )
}

export default ManageNav
