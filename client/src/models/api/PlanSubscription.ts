import Subscription from './Organization'
import { Plan } from './Plan'

export default interface PlanSubscription {
  plan: Plan
  subscription?: Subscription
}
