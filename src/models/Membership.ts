import mongoose, { Schema } from 'mongoose'
import { IOrganization } from './Organization'
import { Role } from './Role'
import { IUser } from './User'

export interface IMembership {
  id?: string
  organization: string | IOrganization
  user: string | IUser
  roles: Role[]
}

export type MembershipType = IMembership & mongoose.Document

export const membershipSchema = new Schema(
  {
    organization: {
      type: String,
      required: true,
      ref: 'Organization',
    },
    user: {
      type: String,
      required: true,
      ref: 'User',
    },
    roles: { type: [String], enum: Object.keys(Role), required: true },
  },
  {
    autoCreate: true,
  }
)

export const Membership = mongoose.model<MembershipType>(
  'Membership',
  membershipSchema
)
