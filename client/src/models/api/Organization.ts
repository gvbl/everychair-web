import { Plan } from './Plan'
import { SubscriptionStatus } from './SubscriptionStatus'

export default interface Subscription {
  status: SubscriptionStatus
}

export default interface Organization {
  id: string
  plan: Plan
  subscription?: Subscription
  name: string
  iconUrl?: string
  cleaning: boolean
}
