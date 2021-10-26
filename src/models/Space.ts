import mongoose, { Schema } from 'mongoose'

export interface ISpace {
  id?: string
  organizationId: string
  locationId: string
  name: string
}

export type SpaceType = ISpace & mongoose.Document

export const spaceSchema = new Schema(
  {
    organizationId: { type: String, required: true },
    locationId: { type: String, required: true },
    name: { type: String, required: true },
  },
  {
    autoCreate: true,
    toJSON: {
      transform: (doc) => {
        return {
          id: doc.id,
          organizationId: doc.organizationId,
          locationId: doc.locationId,
          name: doc.name,
        }
      },
    },
  }
)

export const Space = mongoose.model<SpaceType>('Space', spaceSchema)
