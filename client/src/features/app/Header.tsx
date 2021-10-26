import React, { useRef } from 'react'
import { Button, Container, Image, Nav, Navbar } from 'react-bootstrap'
import { ArrowLeft, ExclamationTriangle, Gear } from 'react-bootstrap-icons'
import { useDispatch, useSelector } from 'react-redux'
import { IndexLinkContainer, LinkContainer } from 'react-router-bootstrap'
import { useHistory, useLocation } from 'react-router-dom'
import { AppDispatch } from '../..'
import useParentPath from '../../hooks/UseParentPath'
import { Role } from '../../models/api/Role'
import { SubscriptionStatus } from '../../models/api/SubscriptionStatus'
import { isSmallScreen } from '../../models/mediaQueries'
import { RootState } from '../../store/index'
import { updateDesks } from '../desks/desksSlice'
import { updateLocations } from '../desks/locationsSlice'
import { updateSpaces } from '../desks/spacesSlice'
import { updateMembers } from '../members/membersSlice'
import { updateReservations } from '../reservations/reservationsSlice'
import { logout } from './userSlice'

interface MainNavSelected {
  isMember: boolean
  isAdmin: boolean
  isOwner: boolean
  isPaymentFailed: boolean
}

const MainNav = () => {
  const dispatch = useDispatch<AppDispatch>()
  const organizationIds = useRef<string[]>([])
  const { isMember, isAdmin, isOwner, isPaymentFailed } = useSelector<
    RootState,
    MainNavSelected
  >((state) => {
    organizationIds.current = Object.keys(state.memberships.entity)
    return {
      isMember: Object.values(state.memberships.entity).length > 0,
      isAdmin:
        Object.values(state.memberships.entity).filter((membership) =>
          membership.roles.includes(Role.ADMIN)
        ).length > 0,
      isOwner:
        Object.values(state.memberships.entity).filter((membership) =>
          membership.roles.includes(Role.OWNER)
        ).length > 0,
      isPaymentFailed:
        Object.values(state.memberships.entity)
          .map((membership) => membership.organization)
          .filter(
            (organization) =>
              organization.subscription?.status ===
              SubscriptionStatus.PAYMENT_FAILED
          ).length > 0,
    }
  })
  return (
    <>
      {!isMember && (
        <LinkContainer to="/start">
          <Nav.Link active={false}>Start</Nav.Link>
        </LinkContainer>
      )}
      {isMember && (
        <>
          <LinkContainer
            to="/reservations"
            onClick={() => {
              dispatch(updateReservations(organizationIds.current))
              dispatch(updateLocations(organizationIds.current))
              dispatch(updateSpaces(organizationIds.current))
              dispatch(updateDesks(organizationIds.current))
            }}
          >
            <Nav.Link active={false}>My reservations</Nav.Link>
          </LinkContainer>
          <LinkContainer
            to="/schedule"
            onClick={() => {
              dispatch(updateReservations(organizationIds.current))
              dispatch(updateLocations(organizationIds.current))
              dispatch(updateSpaces(organizationIds.current))
              dispatch(updateDesks(organizationIds.current))
              dispatch(updateMembers(organizationIds.current))
            }}
          >
            <Nav.Link active={false}>Schedule</Nav.Link>
          </LinkContainer>
        </>
      )}
      {(isAdmin || isOwner) && (
        <LinkContainer to="/manage">
          {isPaymentFailed ? (
            <Button variant="warning">
              Manage
              <ExclamationTriangle
                color="black"
                style={{ marginLeft: '0.5rem', marginTop: '-0.25rem' }}
                size={18}
              />
            </Button>
          ) : (
            <Nav.Link active={false}>Manage</Nav.Link>
          )}
        </LinkContainer>
      )}
    </>
  )
}

interface AuthNavProps {
  isAuthenticated: boolean
}

const AuthNav = ({ isAuthenticated }: AuthNavProps) => {
  let urlLocation = useLocation()
  const dispatch = useDispatch<AppDispatch>()

  return (
    <>
      {isAuthenticated ? (
        <>
          <LinkContainer to="/support">
            <Nav.Link active={false}>Support</Nav.Link>
          </LinkContainer>
          <Nav.Link
            active={false}
            onClick={async () => {
              await dispatch(logout())
              window.location.href = '/api/logout'
            }}
          >
            Log out
          </Nav.Link>
          <LinkContainer to="/settings">
            <Nav.Link active={false}>
              <Gear />
            </Nav.Link>
          </LinkContainer>
        </>
      ) : (
        <>
          <LinkContainer to="/pricing" style={{ marginRight: '1rem' }}>
            <Nav.Link active={false}>Pricing</Nav.Link>
          </LinkContainer>
          <LinkContainer
            to={
              urlLocation.pathname.endsWith('/')
                ? `${urlLocation.pathname}signup`
                : `${urlLocation.pathname}/signup`
            }
          >
            <Button variant="outline-info">Sign up</Button>
          </LinkContainer>
        </>
      )}
    </>
  )
}

const Header = () => {
  const history = useHistory()
  const parent = useParentPath()

  const isAuthenticated = useSelector<RootState, boolean>(
    (state) => !!state.user.entity
  )

  return (
    <div style={{ backgroundColor: '#343a40' }}>
      <Container>
        <Navbar collapseOnSelect expand="sm" bg="dark" variant="dark">
          <Button
            variant=""
            className="navbar-toggler"
            onClick={async () => {
              if (parent) {
                history.push(parent)
              }
            }}
            style={
              isSmallScreen() && parent
                ? { visibility: 'visible' }
                : { visibility: 'hidden' }
            }
          >
            <ArrowLeft />
          </Button>
          <IndexLinkContainer to="/">
            <Nav.Link className="navbar-brand">
              <Image
                src="/logo192.png"
                style={{ width: '2rem', height: '2rem' }}
              />
              Everychair
            </Nav.Link>
          </IndexLinkContainer>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="mr-auto">{isAuthenticated && <MainNav />}</Nav>
            <Nav style={isSmallScreen() ? { display: 'inline-flex' } : {}}>
              <AuthNav isAuthenticated={isAuthenticated} />
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </Container>
    </div>
  )
}

export default Header
