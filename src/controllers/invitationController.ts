import { ClientSession } from 'mongoose'
import { IInvitation, Invitation } from '../models/Invitation'
import { now } from '../util/date'

export const createInvitations = async (
  templates: IInvitation[],
  session?: ClientSession
) => {
  return Invitation.create(templates, { session: session })
}

export const findInvitationById = async (
  invitationId: string,
  session?: ClientSession
) => {
  return Invitation.findById(invitationId, null, {
    session: session,
  })
}

export const findInvitationByToken = async (
  token: string,
  session?: ClientSession
) => {
  return Invitation.findOne({ token: token }, null, {
    session: session,
  })
}

export const findInvitationByTokenOrFail = async (
  token: string,
  session?: ClientSession
) => {
  return Invitation.findOne({ token: token }, null, {
    session: session,
  }).orFail()
}

export const findInvitations = async (
  organizationIds: string[],
  session?: ClientSession
) => {
  return Invitation.find({ organization: { $in: organizationIds } }, null, {
    session: session,
  })
}

export const countInvitations = async (
  organizationId: string,
  session?: ClientSession
) => {
  return Invitation.find({ organization: organizationId }, null, {
    session: session,
  }).countDocuments()
}

export const deleteInvitationByIdOrFail = async (
  invitationId: string,
  session?: ClientSession
) => {
  return Invitation.findByIdAndDelete(invitationId, {
    session: session,
  }).orFail()
}

export const deleteInvitationsByOrganizationId = async (
  organizationId: string,
  session?: ClientSession
) => {
  return Invitation.deleteMany(
    { organization: organizationId },
    {
      session: session,
    }
  )
}

export const oneWeekExpiration = () => {
  const expiration = now()
  expiration.setDate(expiration.getDate() + 7)
  return expiration
}
