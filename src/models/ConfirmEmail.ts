import mongoose, { Schema } from 'mongoose'

export interface IConfirmEmail {
  id?: string
  userId: string
  token: string
}

export type ConfirmEmailType = IConfirmEmail & mongoose.Document

export const confirmEmailSchema = new Schema(
  {
    userId: { type: String, required: true },
    token: { type: String, required: true },
  },
  {
    autoCreate: true,
  }
)

export const ConfirmEmail = mongoose.model<ConfirmEmailType>(
  'ConfirmEmail',
  confirmEmailSchema
)
