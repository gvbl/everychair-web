import { capitalize } from 'lodash'
import React from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import UpgradeModal from '../../components/modals/UpgradeModal'
import { Plan } from '../../models/api/Plan'
import { PlanToSpacesQuotaMap } from '../../models/api/PlanInfo'
import { OrganizationParams } from '../../models/OrganizationParams'
import { RootState } from '../../store'

interface AddSpaceUpgradeModalSelected {
  plan: Plan
  quota: number
}

const AddSpaceUpgradeModal = () => {
  const { organizationId } = useParams<OrganizationParams>()

  const { quota, plan } = useSelector<RootState, AddSpaceUpgradeModalSelected>(
    (state) => {
      const plan = state.memberships.entity[organizationId]?.organization.plan
      const quota = PlanToSpacesQuotaMap[plan]
      return {
        plan: plan,
        quota: quota,
      }
    }
  )

  return (
    <UpgradeModal
      show
      message={`Your organization has reached the maximum of ${quota} spaces for the ${capitalize(
        plan
      )} plan. Upgrade today and add more spaces to your organization.`}
    />
  )
}

export default AddSpaceUpgradeModal
