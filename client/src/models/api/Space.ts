import Desk from './Desk'

export default interface Space {
  id: string
  organizationId: string
  locationId: string
  name: string
  desks: Desk[]
}
