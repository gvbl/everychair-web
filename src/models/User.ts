import mongoose, { Schema } from 'mongoose'
import { linkDomain } from '../util/util'
import { IImage, imageSchema } from './Image'

export const toAvatarUrl = (user: UserType) => {
  return user.avatar
    ? `${linkDomain()}/api/users/${user.id}/avatar/${user.avatar.id}`
    : undefined
}

export enum AuthStrategy {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
}

export interface IUser {
  id?: string
  email: string
  emailConfirmed: boolean
  authStrategy: AuthStrategy
  customerId?: string
  password?: string
  googleId?: string
  firstName?: string
  lastName?: string
  avatar?: IImage
}

export type UserType = IUser & mongoose.Document

const userSchema = new Schema(
  {
    email: { type: String, unique: true, required: true },
    emailConfirmed: { type: Boolean, required: true },
    authStrategy: {
      type: String,
      enum: Object.keys(AuthStrategy),
      required: true,
    },
    customerId: String,
    password: String,
    googleId: String,
    firstName: String,
    lastName: String,
    avatar: imageSchema,
  },
  {
    autoCreate: true,
    toJSON: {
      transform: (doc) => {
        return {
          id: doc.id,
          email: doc.email,
          emailConfirmed: doc.emailConfirmed,
          authStrategy: doc.authStrategy,
          firstName: doc.firstName,
          lastName: doc.lastName,
          avatarUrl: toAvatarUrl(doc),
        }
      },
    },
  }
)

export const User = mongoose.model<UserType>('User', userSchema)
