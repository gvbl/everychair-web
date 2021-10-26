// dates implicitly stored as strings in redux store and revived before use
export interface TimeRange {
  id: string
  start: Date
  end: Date
}

export default interface Reservation {
  id: string
  userId: string
  membershipId: string
  organizationId: string
  locationId: string
  spaceId: string
  deskId: string
  timeRanges: TimeRange[]
}
