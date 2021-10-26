import React, { useEffect } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import { useDispatch, useSelector } from 'react-redux'
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
  useLocation,
} from 'react-router-dom'
import { AppDispatch } from '../..'
import AbsoluteSpinner from '../../components/AbsoluteSpinner'
import '../../components/DatePicker.css'
import ErrorBoundary from '../../components/ErrorBoundary'
import StopError from '../../components/StopError'
import { upOnePath } from '../../hooks/ModalPaths'
import useIsModalPath from '../../hooks/UseIsModalPath'
import User from '../../models/api/User'
import { isLoading, Loading } from '../../models/Loading'
import { isSmallScreen } from '../../models/mediaQueries'
import { RootState } from '../../store'
import CancelCheckoutPage from '../cancel/CancelCheckoutPage'
import CreateOrganizationModal from '../createorganization/CreateOrganizationModal'
import AddDeskModal from '../desks/AddDeskModal'
import AddDeskUpgradeModal from '../desks/AddDeskUpgradeModal'
import AddLocationModal from '../desks/AddLocationModal'
import AddLocationUpgradeModal from '../desks/AddLocationUpgradeModal'
import AddSpaceModal from '../desks/AddSpaceModal'
import AddSpaceUpgradeModal from '../desks/AddSpaceUpgradeModal'
import DeleteDeskModal from '../desks/DeleteDeskModal'
import DeleteLocationModal from '../desks/DeleteLocationModal'
import DeleteSpaceModal from '../desks/DeleteSpaceModal'
import EditLocationAddressModal from '../desks/EditLocationAddressModal'
import EditLocationImageModal from '../desks/EditLocationImageModal'
import EditLocationNameModal from '../desks/EditLocationNameModal'
import EditSpaceNameModal from '../desks/EditSpaceNameModal'
import RemoveLocationAddressModal from '../desks/RemoveLocationAddressModal'
import RemoveLocationImageModal from '../desks/RemoveLocationImageModal'
import EmailConfirmationPage from '../email-confirmation/EmailConfirmationPage'
import HomePage from '../home/HomePage'
import DeleteOrganizationModal from '../manage/DeleteOrganizationModal'
import EditCleaningModal from '../manage/EditCleaningModal'
import EditOrganizationIconModal from '../manage/EditOrganizationIconModal'
import EditOrganizationNameModal from '../manage/EditOrganizationNameModal'
import ManagePage from '../manage/ManagePage'
import RemoveOrganizationIconModal from '../manage/RemoveOrganizationIconModal'
import CancelInvitationModal from '../members/CancelInvitationModal'
import EditRolesModal from '../members/EditRolesModal'
import EmailConfirmationModal from '../members/EmailConfirmationModal'
import InviteModal from '../members/InviteModal'
import InviteUpgradeModal from '../members/InviteUpgradeModal'
import RemoveMemberModal from '../members/RemoveMemberModal'
import ChangePasswordPage from '../password/ChangePasswordPage'
import ResetPasswordPage from '../password/ResetPasswordPage'
import ChangePlanPage from '../pricing-plan/ChangePlanPage'
import MeetQuotaModal from '../pricing-plan/MeetQuotaModal'
import PricingPage from '../pricing-plan/PricingPage'
import PrivacyPolicyPage from '../privacy-policy/PrivacyPolicyPage'
import CancelDayModal from '../reservations/CancelDayModal'
import ReservationDayDetail from '../reservations/ReservationDayDetail'
import MyReservationsMain from '../reservations/MyReservationsMain'
import MyReservationsPage from '../reservations/MyReservationsPage'
import ReserveModal from '../reservations/reservemodal/ReserveModal'
import RsvpPage from '../rsvp/RsvpPage'
import ChangePasswordModal from '../settings/ChangePasswordModal'
import DeleteAccountModal from '../settings/DeleteAccountModal'
import EditAvatarModal from '../settings/EditAvatarModal'
import EditNameModal from '../settings/EditNameModal'
import RemoveAvatarModal from '../settings/RemoveAvatarModal'
import SettingsPage from '../settings/SettingsPage'
import StartPage from '../start/StartPage'
import SupportPage from '../support/SupportPage'
import TermsPage from '../terms/TermsPage'
import ForbiddenPage from './ForbiddenPage'
import Header from './Header'
import LogInModal from './LogInModal'
import { fetchMemberships } from './membershipsSlice'
import ModalState from './ModalState'
import NotFoundPage from './NotFoundPage'
import PrivateRoute from './PrivateRoute'
import SignUpModal from './SignUpModal'
import UnauthorizedPage from './UnauthorizedPage'
import { fetchUser } from './userSlice'
import SchedulePage from '../schedule/SchedulePage'
import DebugPage from '../debug/DebugPage'

const ModalRoutes = () => {
  let urlLocation = useLocation<ModalState>()

  return (
    <Switch>
      <Route
        path={'*/signup'}
        children={<SignUpModal origin={urlLocation.pathname} />}
      />
      <Route
        path={'*/login'}
        children={<LogInModal origin={urlLocation.pathname} />}
      />
      <Route
        path={'*/create-organization'}
        children={<CreateOrganizationModal />}
      />
      <Route
        path={'/reservations/:reservationId/days/:timeRangeId/cancel-day'}
        children={<CancelDayModal />}
      />
      <Route
        path={[
          '/reservations/:reservationId/days/:timeRangeId/reserve',
          '/reservations/reserve',
          '/schedule/organizations/:organizationId/locations/:locationId/reserve',
        ]}
        children={<ReserveModal />}
      />
      <Route
        path={[
          '/manage/organizations/:organizationId/members/email-confirmation',
          '/manage/organizations/:organizationId/members/:membershipId/email-confirmation',
        ]}
        children={<EmailConfirmationModal />}
      />
      <Route
        path={[
          '/manage/organizations/:organizationId/members/invite',
          '/manage/organizations/:organizationId/members/:membershipId/invite',
          '/manage/organizations/:organizationId/members/invitations/:invitationId/invite',
        ]}
        children={<InviteModal />}
      />
      <Route
        path={[
          '/manage/organizations/:organizationId/members/invite-upgrade',
          '/manage/organizations/:organizationId/members/:membershipId/invite-upgrade',
        ]}
        children={<InviteUpgradeModal />}
      />
      <Route
        path={
          '/manage/organizations/:organizationId/members/invitations/:invitationId/cancel-invite'
        }
        children={<CancelInvitationModal />}
      />
      <Route
        path={
          '/manage/organizations/:organizationId/members/:membershipId/edit-roles'
        }
        children={<EditRolesModal />}
      />
      <Route
        path={
          '/manage/organizations/:organizationId/members/:membershipId/remove-member'
        }
        children={<RemoveMemberModal />}
      />
      <Route
        path={
          '/manage/organizations/:organizationId/desks/locations/:locationId/delete-location'
        }
        children={<DeleteLocationModal />}
      />
      <Route
        path={
          '/manage/organizations/:organizationId/desks/locations/:locationId/add-space'
        }
        children={<AddSpaceModal />}
      />
      <Route
        path={
          '/manage/organizations/:organizationId/desks/locations/:locationId/add-space-upgrade'
        }
        children={<AddSpaceUpgradeModal />}
      />
      <Route
        path={[
          '/manage/organizations/:organizationId/desks/add-location',
          '/manage/organizations/:organizationId/desks/locations/:locationId/add-location',
          '/manage/organizations/:organizationId/desks/locations/:locationId/spaces/:spaceId/add-location',
        ]}
        children={<AddLocationModal />}
      />
      <Route
        path={[
          '/manage/organizations/:organizationId/desks/add-location-upgrade',
          '/manage/organizations/:organizationId/desks/locations/:locationId/add-location-upgrade',
          '/manage/organizations/:organizationId/desks/locations/:locationId/spaces/:spaceId/add-location-upgrade',
        ]}
        children={<AddLocationUpgradeModal />}
      />
      <Route
        path={
          '/manage/organizations/:organizationId/desks/locations/:locationId/edit-location-name'
        }
        children={<EditLocationNameModal />}
      />
      <Route
        path={
          '/manage/organizations/:organizationId/desks/locations/:locationId/edit-location-image'
        }
        children={<EditLocationImageModal />}
      />
      <Route
        path={
          '/manage/organizations/:organizationId/desks/locations/:locationId/remove-location-image'
        }
        children={<RemoveLocationImageModal />}
      />
      <Route
        path={
          '/manage/organizations/:organizationId/desks/locations/:locationId/edit-location-address'
        }
        children={<EditLocationAddressModal />}
      />
      <Route
        path={
          '/manage/organizations/:organizationId/desks/locations/:locationId/remove-location-address'
        }
        children={<RemoveLocationAddressModal />}
      />
      <Route
        path={
          '/manage/organizations/:organizationId/desks/locations/:locationId/spaces/:spaceId/add-desk'
        }
        children={<AddDeskModal />}
      />
      <Route
        path={
          '/manage/organizations/:organizationId/desks/locations/:locationId/spaces/:spaceId/add-desk-upgrade'
        }
        children={<AddDeskUpgradeModal />}
      />
      <Route
        path={
          '/manage/organizations/:organizationId/desks/locations/:locationId/spaces/:spaceId/delete-desk'
        }
        children={<DeleteDeskModal />}
      />
      <Route
        path={
          '/manage/organizations/:organizationId/desks/locations/:locationId/spaces/:spaceId/delete-space'
        }
        children={<DeleteSpaceModal />}
      />
      <Route
        path={
          '/manage/organizations/:organizationId/desks/locations/:locationId/spaces/:spaceId/edit-space-name'
        }
        children={<EditSpaceNameModal />}
      />
      <Route
        path={
          '/manage/organizations/:organizationId/organization/edit-cleaning'
        }
        children={<EditCleaningModal />}
      />
      <Route
        path={
          '/manage/organizations/:organizationId/organization/edit-organization-name'
        }
        children={<EditOrganizationNameModal />}
      />
      <Route
        path={
          '/manage/organizations/:organizationId/organization/edit-organization-icon'
        }
        children={<EditOrganizationIconModal />}
      />
      <Route
        path={
          '/manage/organizations/:organizationId/organization/remove-organization-icon'
        }
        children={<RemoveOrganizationIconModal />}
      />
      <Route
        path={
          '/manage/organizations/:organizationId/organization/delete-organization'
        }
        children={<DeleteOrganizationModal />}
      />
      <Route
        path={'/change-plan/:organizationId/meet-quota'}
        children={<MeetQuotaModal />}
      />
      <Route
        path={'/settings/change-password'}
        children={<ChangePasswordModal />}
      />
      <Route path={'/settings/edit-avatar'} children={<EditAvatarModal />} />
      <Route
        path={'/settings/remove-avatar'}
        children={<RemoveAvatarModal />}
      />
      <Route path={'/settings/edit-name'} children={<EditNameModal />} />
      <Route
        path={'/settings/delete-account'}
        children={<DeleteAccountModal />}
      />
    </Switch>
  )
}

const AppRoutes = () => {
  const urlLocation = useLocation<ModalState>()
  const isModalPath = useIsModalPath()

  const background =
    (urlLocation.state && urlLocation.state.background) ||
    (isModalPath && { pathname: upOnePath(urlLocation.pathname) })

  const isMember = useSelector<RootState, boolean>(
    (state) => Object.values(state.memberships.entity).length > 0
  )
  return (
    <>
      <Switch location={background || urlLocation}>
        <PrivateRoute path="/landing">
          {isMember ? (
            <Redirect to="/reservations" />
          ) : (
            <Redirect to="/start" />
          )}
        </PrivateRoute>
        <PrivateRoute path="/start">
          <ErrorBoundary component={StartPage} />
        </PrivateRoute>
        <PrivateRoute
          path={[
            '/reservations/:reservationId/days/:timeRangeId',
            '/reservations',
          ]}
        >
          <ErrorBoundary component={MyReservationsPage} />
        </PrivateRoute>
        <PrivateRoute path="/cleaning/:reservationId/days/:timeRangeId">
          <ErrorBoundary component={ReservationDayDetail} />
        </PrivateRoute>
        <PrivateRoute path="/schedule">
          <ErrorBoundary component={SchedulePage} />
        </PrivateRoute>
        <PrivateRoute manage path="/manage">
          <ErrorBoundary component={ManagePage} />
        </PrivateRoute>
        <PrivateRoute path="/change-plan/:organizationId">
          <ErrorBoundary component={ChangePlanPage} />
        </PrivateRoute>
        <PrivateRoute path="/cancel-checkout/:organizationId">
          <ErrorBoundary component={CancelCheckoutPage} />
        </PrivateRoute>
        <PrivateRoute path="/settings">
          <ErrorBoundary component={SettingsPage} />
        </PrivateRoute>
        <Route path="/unauthorized">
          <ErrorBoundary component={UnauthorizedPage} />
        </Route>
        <Route path="/forbidden">
          <ErrorBoundary component={ForbiddenPage} />
        </Route>
        <Route path="/pricing">
          <ErrorBoundary component={PricingPage} />
        </Route>
        <Route path="/support">
          <ErrorBoundary component={SupportPage} />
        </Route>
        <Route exact path={'/'}>
          <ErrorBoundary component={HomePage} />
        </Route>
        <Route path="*">
          <ErrorBoundary component={NotFoundPage} />
        </Route>
      </Switch>
      {background && <ModalRoutes />}
    </>
  )
}

const MobileAppRoutes = () => {
  let urlLocation = useLocation<ModalState>()
  const isModalPath = useIsModalPath()

  const background =
    (urlLocation.state && urlLocation.state.background) ||
    (isModalPath && { pathname: upOnePath(urlLocation.pathname) })

  const isMember = useSelector<RootState, boolean>(
    (state) => Object.values(state.memberships.entity).length > 0
  )

  return (
    <>
      <Switch location={background || urlLocation}>
        <PrivateRoute path="/landing">
          {isMember ? (
            <Redirect to="/reservations" />
          ) : (
            <Redirect to="/start" />
          )}
        </PrivateRoute>
        <PrivateRoute path="/start">
          <ErrorBoundary component={StartPage} />
        </PrivateRoute>
        <PrivateRoute path="/reservations/:reservationId/days/:timeRangeId">
          <ErrorBoundary component={ReservationDayDetail} />
        </PrivateRoute>
        <PrivateRoute path="/reservations">
          <ErrorBoundary component={MyReservationsMain} />
        </PrivateRoute>
        <PrivateRoute path="/cleaning/:reservationId/days/:timeRangeId">
          <ErrorBoundary component={ReservationDayDetail} />
        </PrivateRoute>
        <PrivateRoute path="/schedule">
          <ErrorBoundary component={SchedulePage} />
        </PrivateRoute>
        <PrivateRoute manage path="/manage">
          <ErrorBoundary component={ManagePage} />
        </PrivateRoute>
        <PrivateRoute path="/change-plan/:organizationId">
          <ErrorBoundary component={ChangePlanPage} />
        </PrivateRoute>
        <PrivateRoute path="/cancel-checkout/:organizationId">
          <ErrorBoundary component={CancelCheckoutPage} />
        </PrivateRoute>
        <PrivateRoute path="/settings">
          <ErrorBoundary component={SettingsPage} />
        </PrivateRoute>
        <Route path="/unauthorized">
          <ErrorBoundary component={UnauthorizedPage} />
        </Route>
        <Route path="/forbidden">
          <ErrorBoundary component={ForbiddenPage} />
        </Route>
        <Route path="/pricing">
          <ErrorBoundary component={PricingPage} />
        </Route>
        <Route path="/support">
          <ErrorBoundary component={SupportPage} />
        </Route>
        <Route exact path={'/'}>
          <ErrorBoundary component={HomePage} />
        </Route>
        <Route path="*">
          <ErrorBoundary component={NotFoundPage} />
        </Route>
      </Switch>
      {background && <ModalRoutes />}
    </>
  )
}

const AppWithHeader = () => {
  return (
    <div className="d-flex h-100 flex-column" style={{ position: 'relative' }}>
      <Route
        path={[
          '/manage/organizations/:organizationId/members/invitations/:invitationId',
          '/manage/organizations/:organizationId/members/:membershipId',
          '/manage/organizations/:organizationId/desks/locations/:locationId/spaces/:spaceId',
          '/manage/organizations/:organizationId/desks/locations/:locationId',
          '/reservations/:reservationId/days/:timeRangeId',
          '/schedule/organizations/:organizationId/locations/:locationId',
          '*',
        ]}
      >
        <Header />
      </Route>
      <div className="d-flex flex-column" style={{ flex: '1', minHeight: '0' }}>
        {isSmallScreen() ? <MobileAppRoutes /> : <AppRoutes />}
      </div>
    </div>
  )
}

interface AppSelected {
  user?: User
  userLoading: Loading
  membershipsLoading: Loading
}

const App = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user, userLoading, membershipsLoading } = useSelector<
    RootState,
    AppSelected
  >((state) => {
    return {
      user: state.user.entity,
      userLoading: state.user.loading,
      membershipsLoading: state.memberships.loading,
    }
  })

  useEffect(() => {
    const fetchUserAndMemberships = async () => {
      const resultAction = await dispatch(fetchUser())
      if (fetchUser.fulfilled.match(resultAction) && resultAction.payload) {
        dispatch(fetchMemberships())
      }
    }
    fetchUserAndMemberships()
  }, [dispatch])

  if (isLoading(userLoading) || (user && isLoading(membershipsLoading))) {
    return <AbsoluteSpinner />
  }
  if (
    userLoading === Loading.FAILED ||
    (user && membershipsLoading === Loading.FAILED)
  ) {
    return <StopError />
  }
  return (
    <Router>
      <Switch>
        <Route path="/email-confirmation/:token">
          <ErrorBoundary component={EmailConfirmationPage} />
        </Route>
        <Route path="/reset-password">
          <ErrorBoundary component={ResetPasswordPage} />
        </Route>
        <Route path="/change-password/:token">
          <ErrorBoundary component={ChangePasswordPage} />
        </Route>
        <Route path="/rsvp/:token">
          <ErrorBoundary component={RsvpPage} />
        </Route>
        <Route path="/privacy-policy" component={PrivacyPolicyPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/debug">
          <ErrorBoundary component={DebugPage} />
        </Route>
        <Route path="*">
          <AppWithHeader />
        </Route>
      </Switch>
    </Router>
  )
}

export default App
