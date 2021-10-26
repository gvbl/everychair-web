import { capitalize } from 'lodash'
import React from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import UpgradeModal from '../../components/modals/UpgradeModal'
import { Plan } from '../../models/api/Plan'
import { PlanToMembersQuotaMap } from '../../models/api/PlanInfo'
import { OrganizationParams } from '../../models/OrganizationParams'
import { RootState } from '../../store'

interface InviteUpgradeModalSelected {
  plan: Plan
  quota: number
}

const InviteUpgradeModal = () => {
  const { organizationId } = useParams<OrganizationParams>()

  const { quota, plan } = useSelector<RootState, InviteUpgradeModalSelected>(
    (state) => {
      const plan = state.memberships.entity[organizationId]?.organization.plan
      const quota = PlanToMembersQuotaMap[plan]
      return {
        plan: plan,
        quota: quota,
      }
    }
  )
  return (
    <UpgradeModal
      show
      message={`Your organization has reached the maximum of ${quota} members for the ${capitalize(
        plan
      )} plan. Upgrade today and add more members to your organization.`}
    />
  )
}

export default InviteUpgradeModal
