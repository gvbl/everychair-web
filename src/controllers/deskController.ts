import { ClientSession } from 'mongoose'
import { Desk, IDesk } from '../models/Desk'

export const createDesk = async (template: IDesk, session?: ClientSession) => {
  const desks = await Desk.create([template], {
    session: session,
  })
  return desks[0]
}

export const findDeskById = async (deskId: string, session?: ClientSession) => {
  return Desk.findById(deskId, null, {
    session: session,
  })
}

export const findDeskByIdOrFail = async (
  deskId: string,
  session?: ClientSession
) => {
  return Desk.findById(deskId, null, {
    session: session,
  }).orFail()
}

export const deleteDeskByIdOrFail = async (
  deskId: string,
  session?: ClientSession
) => {
  return Desk.findByIdAndDelete(deskId, {
    session: session,
  }).orFail()
}

export const deleteDesksByOrganizationId = async (
  organizationId: string,
  session?: ClientSession
) => {
  return Desk.deleteMany(
    { organizationId: organizationId },
    {
      session: session,
    }
  )
}

export const deleteDesksByLocationId = async (
  locationId: string,
  session?: ClientSession
) => {
  return Desk.deleteMany(
    { locationId: locationId },
    {
      session: session,
    }
  )
}

export const deleteDesksBySpaceId = async (
  spaceId: string,
  session?: ClientSession
) => {
  return Desk.deleteMany(
    { spaceId: spaceId },
    {
      session: session,
    }
  )
}

export const countDesks = async (
  organizationId: string,
  session?: ClientSession
) => {
  return Desk.find({ organizationId: organizationId }, null, {
    session: session,
  }).countDocuments()
}

export const findDesks = async (
  organizationIds: string[],
  session?: ClientSession
) => {
  return Desk.find({ organizationId: { $in: organizationIds } }, null, {
    session: session,
  })
}
