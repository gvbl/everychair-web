import { OrganizationParams } from './OrganizationParams'

export interface MemberParams extends OrganizationParams {
  membershipId: string
}
