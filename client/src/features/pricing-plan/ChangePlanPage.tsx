import { useStripe } from '@stripe/react-stripe-js'
import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { Alert, Container } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import RelativeSpinner from '../../components/RelativeSpinner'
import StopError from '../../components/StopError'
import { Plan } from '../../models/api/Plan'
import {
  PlanToDesksQuotaMap,
  PlanToLevelMap,
  PlanToLocationsQuotaMap,
  PlanToMembersQuotaMap,
  PlanToSpacesQuotaMap,
} from '../../models/api/PlanInfo'
import { Role } from '../../models/api/Role'
import { Loading, isLoading } from '../../models/Loading'
import { isSmallScreen } from '../../models/mediaQueries'
import { OrganizationParams } from '../../models/OrganizationParams'
import { RootState } from '../../store'
import { useQuery } from '../../util/query'
import { linkDomain } from '../../util/util'
import { cancelPlan, changePlan } from '../app/membershipsSlice'
import { fetchDesks } from '../desks/desksSlice'
import { fetchLocations } from '../desks/locationsSlice'
import { fetchSpaces } from '../desks/spacesSlice'
import { fetchInvitations } from '../members/invitationsSlice'
import { fetchMembers } from '../members/membersSlice'
import ProductCard from './ProductCard'

export interface ChangePlanData {
  organizationId: string
  body: {
    plan: Plan
  }
}

interface ChangePlanPageSelected {
  currentPlan: Plan
  freePlansCount: number
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

const ChangePlanPage = () => {
  const { organizationId } = useParams<OrganizationParams>()
  const warning = useQuery().get('warning')
  const history = useHistory()
  const dispatch = useDispatch<AppDispatch>()
  const urlLocation = useLocation()
  const adminOrganizationIds = useRef<string[]>([])
  const stripe = useStripe()

  const [changingPlan, setChangingPlan] = useState<Plan | null>()
  const [genericError, setGenericError] = useState<string | null>()
  const [genericWarning, setGenericWarning] = useState<string | null>()

  useEffect(() => {
    if (warning) {
      setGenericWarning('Your plan was not changed.')
    }
  }, [urlLocation.search, warning, setGenericWarning])

  const {
    currentPlan,
    freePlansCount,
    membersAndInvitationsCount,
    locationsCount,
    spacesCount,
    desksCount,
    locationsLoading,
    spacesLoading,
    desksLoading,
    membersLoading,
    invitationsLoading,
  } = useSelector<RootState, ChangePlanPageSelected>((state) => {
    adminOrganizationIds.current = Object.values(state.memberships.entity)
      .filter((membership) => membership.roles.includes(Role.ADMIN))
      .map((membership) => membership.organization.id)
    return {
      currentPlan: state.memberships.entity[organizationId]?.organization.plan,
      freePlansCount: Object.values(state.memberships.entity).filter(
        (membership) => membership.organization.plan === Plan.FREE
      ).length,
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
      spacesCount: Object.values(state.locations.entity).filter(
        (space) => space.organizationId === organizationId
      ).length,
      desksCount: Object.values(state.locations.entity).filter(
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

  const isBelowNewQuota = (plan: Plan) => {
    if (PlanToLevelMap[plan] > PlanToLevelMap[currentPlan]) {
      return true
    }
    if (plan === Plan.FREE && freePlansCount > 0) {
      return false
    }
    return (
      membersAndInvitationsCount <= PlanToMembersQuotaMap[plan] &&
      locationsCount <= PlanToLocationsQuotaMap[plan] &&
      spacesCount <= PlanToSpacesQuotaMap[plan] &&
      desksCount <= PlanToDesksQuotaMap[plan]
    )
  }

  const handleCancelPlan = async () => {
    if (!isBelowNewQuota(Plan.FREE)) {
      history.push(
        `/change-plan/${organizationId}/meet-quota?plan=${Plan.FREE}`
      )
      return
    }
    setChangingPlan(Plan.FREE)
    const resultAction = await dispatch(cancelPlan(organizationId))
    if (cancelPlan.fulfilled.match(resultAction)) {
      history.push(
        `/manage/organizations/${organizationId}/organization?success=changePlanSuccess`
      )
      return
    } else {
      setGenericError('Unable to change plan')
    }
    setChangingPlan(null)
  }

  const handleChangePlan = async (plan: Plan) => {
    if (!isBelowNewQuota(plan)) {
      history.push(`/change-plan/${organizationId}/meet-quota?plan=${plan}`)
      return
    }
    setChangingPlan(plan)
    const resultAction = await dispatch(
      changePlan({ organizationId: organizationId, body: { plan: plan } })
    )
    if (changePlan.fulfilled.match(resultAction)) {
      history.push(
        `/manage/organizations/${organizationId}/organization?success=changePlanSuccess`
      )
      return
    } else {
      setGenericError('Unable to change plan')
    }
    setChangingPlan(null)
  }

  const handleCheckoutPlan = async (plan: Plan) => {
    try {
      if (!stripe) {
        setChangingPlan(null)
        setGenericError('Unable to change plan')
        console.error('Stripe Elements missing')
        return
      }
      setChangingPlan(plan)
      const encodedCancelRedirect = encodeURIComponent(
        `/change-plan/${organizationId}?warning=checkoutCancelled`
      )
      const { data } = await axios.post(
        `/api/organizations/${organizationId}/checkout-plan`,
        {
          plan: plan,
          successUrl: `${linkDomain()}/manage/organizations/${organizationId}/organization?success=changePlanSuccess&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${linkDomain()}/cancel-checkout/${organizationId}?redirect=${encodedCancelRedirect}`,
        }
      )
      await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })
    } catch (err: any) {
      setGenericError('Unable to change plan')
      axios.post('/api/log/error', {
        message: JSON.stringify(err),
      })
    }
    setChangingPlan(null)
  }

  const handleChange = async (plan: Plan) => {
    setGenericError(null)
    setGenericWarning(null)
    if (plan === Plan.FREE) {
      await handleCancelPlan()
      return
    }
    if (currentPlan !== Plan.FREE) {
      await handleChangePlan(plan)
      return
    }
    await handleCheckoutPlan(plan)
  }

  if (
    isLoading(locationsLoading) ||
    isLoading(spacesLoading) ||
    isLoading(desksLoading) ||
    isLoading(membersLoading) ||
    isLoading(invitationsLoading)
  ) {
    return <RelativeSpinner />
  }

  if (
    locationsLoading === Loading.FAILED ||
    spacesLoading === Loading.FAILED ||
    desksLoading === Loading.FAILED ||
    membersLoading === Loading.FAILED ||
    invitationsLoading === Loading.FAILED
  ) {
    return <StopError />
  }

  return (
    <>
      <div className="h-100" style={{ overflowY: 'auto' }}>
        <h1
          style={
            isSmallScreen()
              ? { textAlign: 'center', margin: '2rem' }
              : { textAlign: 'center', margin: '4rem' }
          }
        >
          Change Plan
        </h1>

        <Container>
          {genericError && <Alert variant="danger"> {genericError} </Alert>}
          {genericWarning && (
            <Alert variant="warning"> {genericWarning} </Alert>
          )}
          <div
            style={{
              display: 'grid',
              justifyItems: 'center',
              columnGap: '0.5rem',
              rowGap: '1.5rem',
              gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
            }}
          >
            <ProductCard
              onChange={handleChange}
              plan={Plan.FREE}
              changeText="Change to Free"
              disabled={currentPlan === Plan.FREE}
              loading={changingPlan === Plan.FREE}
            />
            <ProductCard
              onChange={handleChange}
              plan={Plan.STARTER}
              changeText="Change to Starter"
              disabled={currentPlan === Plan.STARTER}
              loading={changingPlan === Plan.STARTER}
            />
            <ProductCard
              onChange={handleChange}
              plan={Plan.PROFESSIONAL}
              changeText="Change to Professional"
              disabled={currentPlan === Plan.PROFESSIONAL}
              loading={changingPlan === Plan.PROFESSIONAL}
            />
            <ProductCard
              onChange={handleChange}
              plan={Plan.ENTERPRISE}
              changeText="Change to Enterprise"
              disabled={currentPlan === Plan.ENTERPRISE}
              loading={changingPlan === Plan.ENTERPRISE}
            />
          </div>
          <div className="text-center" style={{ marginTop: '1rem' }}>
            Plans billed monthly, cancel anytime.
          </div>
        </Container>
      </div>
    </>
  )
}

export default ChangePlanPage
