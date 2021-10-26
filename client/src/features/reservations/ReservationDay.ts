import Reservation, { TimeRange } from '../../models/api/Reservation'
import { isUpcomingDay } from '../../util/date'

export default interface ReservationDay {
  id: string
  userId: string
  membershipId: string
  organizationId: string
  spaceId: string
  deskId: string
  timeRange: TimeRange
}

export const toReservationDays = (
  reservations: Reservation[],
  userId?: string
) => {
  const filteredReservations = userId
    ? reservations.filter((reservation) => reservation.userId === userId)
    : reservations
  const reservationDays: ReservationDay[] = []
  filteredReservations.forEach((reservation) => {
    reservationDays.push(
      ...reservation.timeRanges.map((timeRange) => {
        return {
          id: reservation.id,
          userId: reservation.userId,
          membershipId: reservation.membershipId,
          organizationId: reservation.organizationId,
          spaceId: reservation.spaceId,
          deskId: reservation.deskId,
          timeRange: timeRange,
        }
      })
    )
  })
  return reservationDays
    .filter((reservationDay) => isUpcomingDay(reservationDay.timeRange.start))
    .sort(
      (a: ReservationDay, b: ReservationDay) =>
        a.timeRange.start.getTime() - b.timeRange.start.getTime()
    )
}
