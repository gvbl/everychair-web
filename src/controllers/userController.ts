import { ClientSession } from 'mongoose'
import { IUser, User } from '../models/User'

export const createUser = async (template: IUser, session?: ClientSession) => {
  const users = await User.create([template], { session: session })
  return users[0]
}

export const findUserByIdOrFail = async (
  userId: string,
  session?: ClientSession
) => {
  return User.findById(userId, null, {
    session: session,
  }).orFail()
}

export const findUserOrFail = async (
  conditions: Partial<IUser>,
  session?: ClientSession
) => {
  return User.findOne(conditions, null, {
    session: session,
  }).orFail()
}

export const updateUserOrFail = async (
  userId: string,
  modify: Partial<IUser>,
  session?: ClientSession
) => {
  return User.findByIdAndUpdate(userId, modify, {
    new: true,
    session: session,
  }).orFail()
}

export const deleteUserOrFail = async (
  userId: string,
  session?: ClientSession
) => {
  return User.findByIdAndDelete(userId, {
    session: session,
  }).orFail()
}
