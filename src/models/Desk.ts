import mongoose, { Schema } from 'mongoose'
import { linkDomain } from '../util/util'
import { IImage, imageSchema } from './Image'

export interface IDesk {
  id?: string
  organizationId: string
  locationId: string
  spaceId: string
  name: string
  image?: IImage
}

export type DeskType = IDesk & mongoose.Document

export const deskSchema = new Schema(
  {
    organizationId: { type: String, required: true },
    locationId: { type: String, required: true },
    spaceId: { type: String, required: true },
    name: { type: String, required: true },
    image: imageSchema,
  },
  {
    autoCreate: true,
    toJSON: {
      transform: (doc) => {
        return {
          id: doc.id,
          organizationId: doc.organizationId,
          locationId: doc.locationId,
          spaceId: doc.spaceId,
          name: doc.name,
          imageUrl: doc.image
            ? `${linkDomain()}/api/desks/${doc.id}/image/${doc.image.id}`
            : undefined,
        }
      },
    },
  }
)

export const Desk = mongoose.model<DeskType>('Desk', deskSchema)
