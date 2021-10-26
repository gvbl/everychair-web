import { Role } from './Role'

export default interface Member {
  membershipId: string
  organizationId: string
  userId: string
  email: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  roles: Role[]
}
