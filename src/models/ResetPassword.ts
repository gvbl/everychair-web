import mongoose, { Schema } from 'mongoose'

export interface IResetPassword {
  id?: string
  userId: string
  token: string
  expiration: Date
}

export type ResetPasswordType = IResetPassword & mongoose.Document

export const resetPasswordSchema = new Schema(
  {
    userId: { type: String, required: true },
    token: { type: String, required: true },
    expiration: { type: Date, required: true },
  },
  {
    autoCreate: true,
  }
)

export const ResetPassword = mongoose.model<ResetPasswordType>(
  'ResetPassword',
  resetPasswordSchema
)
