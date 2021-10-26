import mongoose from 'mongoose'
import { Schema } from 'mongoose'
import { IOrganization } from './Organization'

export interface IInvitation {
  id?: string
  organization: string | IOrganization
  email: string
  token: string
  expiration: Date
}

export type InvitationType = IInvitation & mongoose.Document

export const invitationSchema = new Schema(
  {
    organization: {
      type: String,
      required: true,
      ref: 'Organization',
    },
    email: { type: String, required: true },
    token: { type: String, required: true },
    expiration: { type: Date, required: true },
  },
  {
    autoCreate: true,
    toJSON: {
      transform: (doc) => {
        return {
          id: doc.id,
          organizationId: doc.organization,
          email: doc.email,
          expiration: doc.expiration,
        }
      },
    },
  }
)

export const Invitation = mongoose.model<InvitationType>(
  'Invitation',
  invitationSchema
)
