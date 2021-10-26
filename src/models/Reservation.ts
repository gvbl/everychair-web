import mongoose, { Schema } from 'mongoose'

export interface ITimeRange {
  id?: string
  start: Date
  end: Date
}

export const timeRangeSchema = new Schema(
  {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  {
    autoCreate: true,
    toJSON: {
      transform: (doc) => {
        return {
          id: doc.id,
          start: doc.start,
          end: doc.end,
        }
      },
    },
  }
)

export interface IReservation {
  id?: string
  userId: string
  membershipId: string
  organizationId: string
  locationId: string
  spaceId: string
  deskId: string
  timeRanges: ITimeRange[]
}

export type ReservationType = IReservation & mongoose.Document

export const reservationSchema = new Schema(
  {
    userId: { type: String, required: true },
    membershipId: { type: String, required: true },
    organizationId: { type: String, required: true },
    locationId: { type: String, required: true },
    spaceId: { type: String, required: true },
    deskId: { type: String, required: true },
    timeRanges: { type: [timeRangeSchema], required: true },
  },
  {
    autoCreate: true,
    toJSON: {
      transform: (doc) => {
        return {
          id: doc.id,
          userId: doc.userId,
          membershipId: doc.membershipId,
          organizationId: doc.organizationId,
          locationId: doc.locationId,
          spaceId: doc.spaceId,
          deskId: doc.deskId,
          timeRanges: doc.timeRanges,
        }
      },
    },
  }
)

export const Reservation = mongoose.model<ReservationType>(
  'Reservation',
  reservationSchema
)
