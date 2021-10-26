import Invitation from './api/Invitation'
import Reservation from './api/Reservation'

export const reviveInvitation = (invitation: Invitation) => {
  return {
    ...invitation,
    expiration: new Date(invitation.expiration),
  }
}

export const reviveInvitations = (invitations: Invitation[]) => {
  return invitations.map((invitation) => reviveInvitation(invitation))
}

export const reviveReservation = (reservation: Reservation) => {
  return {
    ...reservation,
    timeRanges: reservation.timeRanges.map((timeRange) => {
      return {
        id: timeRange.id,
        start: new Date(timeRange.start),
        end: new Date(timeRange.end),
      }
    }),
  }
}

export const reviveReservations = (reservations: Reservation[]) => {
  return reservations.map((reservation) => reviveReservation(reservation))
}
