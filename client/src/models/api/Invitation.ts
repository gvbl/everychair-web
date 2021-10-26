// dates implicitly stored as strings in redux store and revived before use
export default interface Invitation {
  id: string
  organizationId: string
  email: string
  expiration: Date
}
