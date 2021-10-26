import { ClientSession, FilterQuery } from 'mongoose'
import {
  IReservation,
  Reservation,
  ReservationType,
} from '../models/Reservation'

export const createReservation = async (
  template: IReservation,
  session?: ClientSession
) => {
  const desks = await Reservation.create([template], {
    session: session,
  })
  return desks[0]
}

export const deleteReservationDayByIdOrFail = async (
  reservationId: string,
  timeRangeId: string,
  session?: ClientSession
) => {
  return Reservation.findByIdAndUpdate(
    reservationId,
    { $pull: { timeRanges: { id: timeRangeId } } },
    {
      new: true,
      session: session,
    }
  )
}

export const deleteReservationsByUserId = async (
  userId: string,
  session?: ClientSession
) => {
  return Reservation.deleteMany(
    { userId: userId },
    {
      session: session,
    }
  )
}

export const findReservationById = async (
  reservationId: string,
  session?: ClientSession
) => {
  return Reservation.findById(reservationId, null, {
    session: session,
  })
}

export const findReservationByIdOrFail = async (
  reservationId: string,
  session?: ClientSession
) => {
  return Reservation.findById(reservationId, null, {
    session: session,
  }).orFail()
}

export const deleteReservationByIdOrFail = async (
  spaceId: string,
  session?: ClientSession
) => {
  return Reservation.findByIdAndDelete(spaceId, {
    session: session,
  }).orFail()
}

export const deleteReservationsByOrganizationId = async (
  organizationId: string,
  session?: ClientSession
) => {
  return Reservation.deleteMany(
    { organizationId: organizationId },
    {
      session: session,
    }
  )
}

export const deleteReservationsByLocationId = async (
  locationId: string,
  session?: ClientSession
) => {
  return Reservation.deleteMany(
    { locationId: locationId },
    {
      session: session,
    }
  )
}

export const deleteReservationsBySpaceId = async (
  spaceId: string,
  session?: ClientSession
) => {
  return Reservation.deleteMany(
    { spaceId: spaceId },
    {
      session: session,
    }
  )
}

export const deleteReservationsByDeskId = async (
  deskId: string,
  session?: ClientSession
) => {
  return Reservation.deleteMany(
    { deskId: deskId },
    {
      session: session,
    }
  )
}

export const findReservations = async (
  query: FilterQuery<ReservationType>,
  session?: ClientSession
) => {
  return Reservation.find(query, null, {
    session: session,
  })
}
