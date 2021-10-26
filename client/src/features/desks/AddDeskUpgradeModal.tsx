import { capitalize } from 'lodash'
import React from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import UpgradeModal from '../../components/modals/UpgradeModal'
import { Plan } from '../../models/api/Plan'
import { PlanToDesksQuotaMap } from '../../models/api/PlanInfo'
import { OrganizationParams } from '../../models/OrganizationParams'
import { RootState } from '../../store'

interface AddDeskUpgradeModalSelected {
  plan: Plan
  quota: number
}

const AddDeskUpgradeModal = () => {
  const { organizationId } = useParams<OrganizationParams>()

  const { quota, plan } = useSelector<RootState, AddDeskUpgradeModalSelected>(
    (state) => {
      const plan = state.memberships.entity[organizationId]?.organization.plan
      const quota = PlanToDesksQuotaMap[plan]
      return {
        plan: plan,
        quota: quota,
      }
    }
  )

  return (
    <UpgradeModal
      show
      message={`Your organization has reached the maximum of ${quota} desks for the ${capitalize(
        plan
      )} plan. Upgrade today and add more desks to your organization.`}
    />
  )
}

export default AddDeskUpgradeModal
