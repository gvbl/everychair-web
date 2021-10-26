import { capitalize } from 'lodash'
import React from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import UpgradeModal from '../../components/modals/UpgradeModal'
import { Plan } from '../../models/api/Plan'
import { PlanToLocationsQuotaMap } from '../../models/api/PlanInfo'
import { OrganizationParams } from '../../models/OrganizationParams'
import { RootState } from '../../store'

interface AddLocationUpgradeModalSelected {
  plan: Plan
  quota: number
}

const AddLocationUpgradeModal = () => {
  const { organizationId } = useParams<OrganizationParams>()

  const { quota, plan } = useSelector<
    RootState,
    AddLocationUpgradeModalSelected
  >((state) => {
    const plan = state.memberships.entity[organizationId]?.organization.plan
    const quota = PlanToLocationsQuotaMap[plan]
    return {
      plan: plan,
      quota: quota,
    }
  })

  return (
    <UpgradeModal
      show
      message={`Your organization has reached the maximum of ${quota} location${
        quota > 1 ? 's' : ''
      } for the ${capitalize(
        plan
      )} plan. Upgrade today and add more locations to your organization.`}
    />
  )
}

export default AddLocationUpgradeModal
