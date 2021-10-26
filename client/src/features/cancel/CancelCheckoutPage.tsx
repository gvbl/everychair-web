import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import AbsoluteSpinner from '../../components/AbsoluteSpinner'
import { OrganizationParams } from '../../models/OrganizationParams'
import { useQuery } from '../../util/query'
import { refreshPlanSubscription } from '../app/membershipsSlice'

const CancelCheckoutPage = () => {
  const { organizationId } = useParams<OrganizationParams>()
  const redirect = useQuery().get('redirect')
  const history = useHistory()
  const dispatch = useDispatch<AppDispatch>()

  if (!organizationId) {
    throw new Error("Missing 'organizationId' param")
  }

  if (!redirect) {
    throw new Error("Missing 'redirect' query param")
  }

  useEffect(() => {
    const doRefresh = async () => {
      await dispatch(refreshPlanSubscription(organizationId))
      history.push(redirect)
    }
    doRefresh()
  }, [organizationId, redirect, history, dispatch])

  return <AbsoluteSpinner />
}

export default CancelCheckoutPage
