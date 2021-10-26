import React from 'react'
import { useSelector } from 'react-redux'
import { Redirect, Route, RouteProps } from 'react-router-dom'
import { Role } from '../../models/api/Role'
import { RootState } from '../../store'

interface PrivateRouteProps extends RouteProps {
  manage?: boolean
}

interface PrivateRouteSelected {
  isAuthenticated: boolean
  isAdmin: boolean
  isOwner: boolean
}

const PrivateRoute = ({
  manage = false,
  children,
  ...rest
}: PrivateRouteProps) => {
  const { isAuthenticated, isAdmin, isOwner } = useSelector<
    RootState,
    PrivateRouteSelected
  >((state) => {
    return {
      isAuthenticated: !!state.user.entity,
      isAdmin:
        Object.values(state.memberships.entity).filter((membership) =>
          membership.roles.includes(Role.ADMIN)
        ).length > 0,
      isOwner:
        Object.values(state.memberships.entity).filter((membership) =>
          membership.roles.includes(Role.OWNER)
        ).length > 0,
    }
  })
  const isAuthorized = manage ? isAdmin || isOwner : true
  if (!isAuthenticated) {
    return (
      <Route {...rest}>
        <Redirect to="/forbidden" />
      </Route>
    )
  }
  if (!isAuthorized) {
    return (
      <Route {...rest}>
        <Redirect to="/unauthorized" />
      </Route>
    )
  }
  return <Route {...rest} render={() => children} />
}

export default PrivateRoute
