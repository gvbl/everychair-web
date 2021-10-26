import { Role } from './Role'
import Organization from './Organization'

export default interface Membership {
  organization: Organization
  roles: Role[]
}
