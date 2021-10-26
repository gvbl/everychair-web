import { ClientSession } from 'mongoose'
import { IMembership, Membership } from '../models/Membership'
import { Role } from '../models/Role'
import { Organization } from '../models/Organization'
import { User } from '../models/User'

export const createMembershipPop = async (
  template: IMembership,
  session?: ClientSession
) => {
  const memberships = await Membership.create([template], { session: session })
  return memberships[0]
    .populate({
      path: 'organization',
      model: Organization,
    })
    .execPopulate()
}

export const findMembership = async (
  organizationId: string,
  userId: string,
  session?: ClientSession
) => {
  return Membership.findOne(
    {
      organization: organizationId,
      user: userId,
    },
    null,
    {
      session: session,
    }
  )
}

export const findMembershipOrFail = async (
  organizationId: string,
  userId: string,
  session?: ClientSession
) => {
  return Membership.findOne(
    {
      organization: organizationId,
      user: userId,
    },
    null,
    {
      session: session,
    }
  ).orFail()
}

export const findMembershipById = async (
  membershipId: string,
  session?: ClientSession
) => {
  return Membership.findById(membershipId, null, {
    session: session,
  })
}

export const findMembershipByIdOrFail = async (
  membershipId: string,
  session?: ClientSession
) => {
  return Membership.findById(membershipId, null, {
    session: session,
  }).orFail()
}

export const findMembershipByIdAndUpdateOrFail = async (
  membershipId: string,
  modify: Partial<IMembership>,
  session?: ClientSession
) => {
  return Membership.findByIdAndUpdate(membershipId, modify, {
    new: true,
    session: session,
  }).orFail()
}

export const disableCleaningByOrganizationId = async (
  organizationId: string,
  session?: ClientSession
) => {
  return Membership.updateMany(
    { organization: organizationId, roles: Role.CLEANING },
    { $pull: { roles: Role.CLEANING } },
    {
      session: session,
    }
  )
}

export const countMemberships = async (
  organizationId: string,
  session?: ClientSession
) => {
  return Membership.find({ organization: organizationId }, null, {
    session: session,
  }).countDocuments()
}

export const findMembershipsPop = async (
  organizationIds: string[],
  session?: ClientSession
) => {
  return Membership.find({ organization: { $in: organizationIds } }, null, {
    session: session,
  })
    .populate({
      path: 'user',
      model: User,
    })
    .select('organization roles')
}

export const findAdminMemberships = async (
  organizationIds: string[],
  session?: ClientSession
) => {
  return Membership.find(
    {
      organization: { $in: organizationIds },
      roles: Role.ADMIN,
    },
    null,
    {
      session: session,
    }
  )
}

export const findMembershipsByUserId = async (
  userId: string,
  session?: ClientSession
) => {
  return Membership.find({ user: userId }, null, {
    session: session,
  })
}

export const findMembershipsByUserIdPop = async (
  userId: string,
  session?: ClientSession
) => {
  return Membership.find({ user: userId }, null, {
    session: session,
  })
    .populate({
      path: 'organization',
      model: Organization,
    })
    .select('user roles')
}

export const findOwnerMembershipsByUserId = async (
  userId: string,
  session?: ClientSession
) => {
  return Membership.find({ user: userId, roles: Role.OWNER }, null, {
    session: session,
  })
}

export const isMember = (
  organizationId: string,
  userId: string,
  session?: ClientSession
) => {
  return findMembershipOrFail(organizationId, userId, session)
    .then((_) => {
      return true
    })
    .catch((_) => {
      return false
    })
}

export const deleteMembershipByIdOrFail = async (
  membershipId: string,
  session?: ClientSession
) => {
  return Membership.findByIdAndDelete(membershipId, {
    session: session,
  }).orFail()
}

export const deleteMembershipsByUserId = async (
  userId: string,
  session?: ClientSession
) => {
  return Membership.deleteMany(
    { user: userId },
    {
      session: session,
    }
  )
}

export const deleteMembershipsByOrganizationIdOrFail = async (
  organizationId: string,
  session?: ClientSession
) => {
  return Membership.deleteMany(
    { organization: organizationId },
    {
      session: session,
    }
  ).orFail()
}
