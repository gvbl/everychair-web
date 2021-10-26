export interface Address {
  street: string
  city?: string
  state?: string
  zip?: string
}

export default interface Location {
  id: string
  organizationId: string
  name: string
  timeZone: string
  imageUrl?: string
  address?: Address
}
