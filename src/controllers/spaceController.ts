import { ClientSession } from 'mongoose'
import { ISpace, Space } from '../models/Space'

export const createSpace = async (
  template: ISpace,
  session?: ClientSession
) => {
  const spaces = await Space.create([template], {
    session: session,
  })
  return spaces[0]
}

export const findSpaceById = async (
  spaceId: string,
  session?: ClientSession
) => {
  return Space.findById(spaceId, null, {
    session: session,
  })
}

export const findSpaceByIdOrFail = async (
  spaceId: string,
  session?: ClientSession
) => {
  return Space.findById(spaceId, null, {
    session: session,
  }).orFail()
}

export const updateSpaceOrFail = async (
  spaceId: string,
  modify: Partial<ISpace>,
  session?: ClientSession
) => {
  return Space.findByIdAndUpdate(spaceId, modify, {
    new: true,
    session: session,
  }).orFail()
}

export const deleteSpacesByOrganizationId = async (
  organizationId: string,
  session?: ClientSession
) => {
  return Space.deleteMany(
    { organizationId: organizationId },
    {
      session: session,
    }
  )
}

export const deleteSpacesByLocationId = async (
  locationId: string,
  session?: ClientSession
) => {
  return Space.deleteMany(
    { locationId: locationId },
    {
      session: session,
    }
  )
}

export const deleteSpaceByIdOrFail = async (
  spaceId: string,
  session?: ClientSession
) => {
  return Space.findByIdAndDelete(spaceId, {
    session: session,
  }).orFail()
}

export const countSpaces = async (
  organizationId: string,
  session?: ClientSession
) => {
  return Space.find({ organizationId: organizationId }, null, {
    session: session,
  }).countDocuments()
}

export const findSpaces = async (
  organizationIds: string[],
  session?: ClientSession
) => {
  return Space.find({ organizationId: { $in: organizationIds } }, null, {
    session: session,
  })
}
