import { ClientSession } from 'mongoose'
import { IResetPassword, ResetPassword } from '../models/ResetPassword'
import { now } from '../util/date'

export const createResetPassword = async (
  template: IResetPassword,
  session?: ClientSession
) => {
  return ResetPassword.create([template], {
    session: session,
  })
}

export const findResetPasswordByTokenOrFail = async (
  token: string,
  session?: ClientSession
) => {
  return ResetPassword.findOne({ token: token }, null, {
    session: session,
  }).orFail()
}

export const deleteResetPasswordByUserId = async (
  userId: string,
  session?: ClientSession
) => {
  return ResetPassword.findOneAndDelete(
    { userId: userId },
    {
      session: session,
    }
  )
}

export const threeHourExpiration = () => {
  const expiration = now()
  expiration.setTime(expiration.getTime() + 3 * 60 * 60 * 1000)
  return expiration
}
