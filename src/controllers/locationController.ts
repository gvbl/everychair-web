import { ClientSession } from 'mongoose'
import { ILocation, Location } from '../models/Location'

export const createLocation = async (
  template: ILocation,
  session?: ClientSession
) => {
  const locations = await Location.create([template], {
    session: session,
  })
  return locations[0]
}

export const findLocationById = async (
  locationId: string,
  session?: ClientSession
) => {
  return Location.findById(locationId, null, {
    session: session,
  })
}

export const findLocationByIdOrFail = async (
  locationId: string,
  session?: ClientSession
) => {
  return Location.findById(locationId, null, {
    session: session,
  }).orFail()
}

export const updateLocationOrFail = async (
  locationId: string,
  modify: Partial<ILocation>,
  session?: ClientSession
) => {
  return Location.findByIdAndUpdate(locationId, modify, {
    new: true,
    session: session,
  }).orFail()
}

export const deleteLocationByIdOrFail = async (
  locationId: string,
  session?: ClientSession
) => {
  return Location.findByIdAndDelete(locationId, {
    session: session,
  }).orFail()
}

export const deleteLocationsByOrganizationId = async (
  organizationId: string,
  session?: ClientSession
) => {
  return Location.deleteMany(
    { organizationId: organizationId },
    {
      session: session,
    }
  )
}

export const countLocations = async (
  organizationId: string,
  session?: ClientSession
) => {
  return Location.find({ organizationId: organizationId }, null, {
    session: session,
  }).countDocuments()
}

export const findLocations = async (
  organizationIds: string[],
  session?: ClientSession
) => {
  return Location.find({ organizationId: { $in: organizationIds } }, null, {
    session: session,
  })
}
