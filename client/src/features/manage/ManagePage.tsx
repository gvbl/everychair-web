import React from 'react'
import { useSelector } from 'react-redux'
import { Redirect, Route, Switch } from 'react-router-dom'
import Organization from '../../models/api/Organization'
import { Role } from '../../models/api/Role'
import { isSmallScreen } from '../../models/mediaQueries'
import { RootState } from '../../store'
import DesksMain from '../desks/DesksMain'
import DesksPage from '../desks/DesksPage'
import LocationDetail from '../desks/LocationDetail'
import SpaceDetail from '../desks/SpaceDetail'
import InvitationDetail from '../members/InvitationDetail'
import MemberDetail from '../members/MemberDetail'
import MembersMain from '../members/MembersMain'
import MembersPage from '../members/MembersPage'
import OrganizationPage from '../organization/OrganizationPage'
import OrganizationWelcome from '../organization/OrganizationWelcome'
import ManageNav from './ManageNav'

const ManagePage = () => {
  const manageOrganizations = useSelector<RootState, Organization[]>((state) =>
    Object.values(state.memberships.entity)
      .filter(
        (membership) =>
          membership.roles.includes(Role.OWNER) ||
          membership.roles.includes(Role.ADMIN)
      )
      .map((membership) => membership.organization)
  )

  return (
    <>
      <Route path={['/manage/organizations/:organizationId', '/manage']}>
        <ManageNav manageOrganizations={manageOrganizations} />
      </Route>
      <div className="d-flex flex-column" style={{ flex: '1', minHeight: '0' }}>
        {isSmallScreen() ? (
          <Switch>
            <Route exact path="/manage">
              <Redirect
                to={`/manage/organizations/${manageOrganizations[0].id}/members`}
              />
            </Route>
            <Route
              exact
              path={[
                '/manage/organizations/:organizationId/members/invite',
                '/manage/organizations/:organizationId/members',
              ]}
              component={MembersMain}
            />
            <Route
              path="/manage/organizations/:organizationId/members/invitations/:invitationId"
              component={InvitationDetail}
            />
            <Route
              path="/manage/organizations/:organizationId/members/:membershipId"
              component={MemberDetail}
            />
            <Route
              exact
              path={[
                '/manage/organizations/:organizationId/desks/add-location',
                '/manage/organizations/:organizationId/desks',
              ]}
              component={DesksMain}
            />
            <Route
              exact
              path={[
                '/manage/organizations/:organizationId/desks/locations/:locationId/delete-location',
                '/manage/organizations/:organizationId/desks/locations/:locationId/add-space',
                '/manage/organizations/:organizationId/desks/locations/:locationId',
              ]}
              component={LocationDetail}
            />
            <Route
              path="/manage/organizations/:organizationId/desks/locations/:locationId/spaces/:spaceId"
              component={SpaceDetail}
            />
            <Route
              path="/manage/organizations/:organizationId/organization-welcome"
              component={OrganizationWelcome}
            />
            <Route
              path="/manage/organizations/:organizationId/organization"
              component={OrganizationPage}
            />
          </Switch>
        ) : (
          <Switch>
            <Route exact path="/manage">
              <Redirect
                to={`/manage/organizations/${manageOrganizations[0].id}/members`}
              />
            </Route>
            <Route
              path={[
                '/manage/organizations/:organizationId/members/invitations/:invitationId',
                '/manage/organizations/:organizationId/members/:membershipId',
                '/manage/organizations/:organizationId/members',
              ]}
              component={MembersPage}
            />
            <Route
              path={[
                '/manage/organizations/:organizationId/desks/locations/:locationId/spaces/:spaceId',
                '/manage/organizations/:organizationId/desks/locations/:locationId',
                '/manage/organizations/:organizationId/desks',
              ]}
              component={DesksPage}
            />
            <Route
              path="/manage/organizations/:organizationId/organization-welcome"
              component={OrganizationWelcome}
            />
            <Route
              path="/manage/organizations/:organizationId/organization"
              component={OrganizationPage}
            />
          </Switch>
        )}
      </div>
    </>
  )
}

export default ManagePage
