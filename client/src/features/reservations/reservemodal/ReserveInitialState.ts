export default interface ReserveInitialState {
  organizationId: string
  locationId: string
  spaceId: string
  deskId: string
  days: Date[]
  startTime: Date | null
  endTime: Date | null
}
