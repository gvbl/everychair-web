import mongoose, { Schema } from 'mongoose'
import { linkDomain } from '../util/util'
import { IImage, imageSchema } from './Image'

export interface IAddress {
  street: string
  city?: string
  state?: string
  zip?: string
}

export const addressSchema = {
  street: { type: String, required: true },
  city: String,
  state: String,
  zip: String,
}

export interface ILocation {
  id?: string
  organizationId: string
  timeZone: string
  name: string
  image?: IImage
  address?: IAddress
}

export type LocationType = ILocation & mongoose.Document

export const locationSchema = new Schema(
  {
    organizationId: { type: String, required: true },
    name: { type: String, required: true },
    timeZone: { type: String, required: true },
    image: imageSchema,
    address: { type: addressSchema, required: false },
  },
  {
    autoCreate: true,
    toJSON: {
      transform: (doc) => {
        return {
          id: doc.id,
          organizationId: doc.organizationId,
          name: doc.name,
          imageUrl: doc.image
            ? `${linkDomain()}/api/locations/${doc.id}/image/${doc.image.id}`
            : undefined,
          address: doc.address,
          timeZone: doc.timeZone,
        }
      },
    },
  }
)

export const Location = mongoose.model<LocationType>('Location', locationSchema)
