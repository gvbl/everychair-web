import { ClientSession } from 'mongoose'
import { ConfirmEmail, IConfirmEmail } from '../models/ConfirmEmail'

export const createConfirmEmail = async (
  template: IConfirmEmail,
  session?: ClientSession
) => {
  return ConfirmEmail.create([template], {
    session: session,
  })
}

export const deleteConfirmEmailByUserId = async (
  userId: string,
  session?: ClientSession
) => {
  return ConfirmEmail.findOneAndDelete(
    { userId: userId },
    {
      session: session,
    }
  )
}
