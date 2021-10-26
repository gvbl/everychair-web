import { Schema } from 'mongoose'

export interface IImage {
  id?: string
  data: Buffer
  contentType: string
}

export const imageSchema = new Schema(
  {
    data: { type: Buffer, required: true },
    contentType: String,
  },
  {
    autoCreate: true,
  }
)
