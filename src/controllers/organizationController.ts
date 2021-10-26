import { ClientSession } from 'mongoose'
import { IOrganization, Organization } from '../models/Organization'
import { SubscriptionStatus } from '../models/SubscriptionStatus'

export const createOrganization = async (
  template: IOrganization,
  session?: ClientSession
) => {
  const organizations = await Organization.create([template], {
    session: session,
  })
  return organizations[0]
}

export const updateOrganizationByIdOrFail = async (
  organizationId: string,
  modify: Partial<IOrganization>,
  session?: ClientSession
) => {
  return Organization.findByIdAndUpdate(organizationId, modify, {
    session: session,
  }).orFail()
}

export const updateSubscriptionStatus = async (
  subscriptionId: string,
  status: SubscriptionStatus,
  session?: ClientSession
) => {
  return Organization.findOneAndUpdate(
    { 'subscription.subscriptionId': subscriptionId },
    { 'subscription.status': status },
    {
      session: session,
    }
  ).orFail()
}

export const findOrganizationByIdOrFail = async (
  organizationId: string,
  session?: ClientSession
) => {
  return Organization.findById(organizationId, null, {
    session: session,
  }).orFail()
}

export const updateOrganizationOrFail = async (
  organizationId: string,
  modify: Partial<IOrganization>,
  session?: ClientSession
) => {
  return Organization.findByIdAndUpdate(organizationId, modify, {
    new: true,
    session: session,
  }).orFail()
}

export const deleteOrganizationByIdOrFail = async (
  organizationId: string,
  session?: ClientSession
) => {
  return Organization.findByIdAndDelete(organizationId, {
    session: session,
  }).orFail()
}
