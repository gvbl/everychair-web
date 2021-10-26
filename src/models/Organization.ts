import mongoose, { Schema } from 'mongoose'
import { linkDomain } from '../util/util'
import { IImage, imageSchema } from './Image'
import { Plan } from './Plan'
import { SubscriptionStatus } from './SubscriptionStatus'

export interface ISubscription {
  subscriptionId?: string
  status?: SubscriptionStatus
}

export const subscriptionSchema = new Schema(
  {
    subscriptionId: String,
    status: { type: String, enum: Object.keys(SubscriptionStatus) },
  },
  {
    autoCreate: true,
    toJSON: {
      transform: (doc) => {
        return {
          status: doc.status,
        }
      },
    },
  }
)

export interface IOrganization {
  id?: string
  plan: Plan
  subscription?: ISubscription
  name: string
  icon?: IImage
  cleaning: boolean
}

export type OrganizationType = IOrganization & mongoose.Document

export const organizationSchema = new Schema(
  {
    plan: { type: String, enum: Object.keys(Plan), required: true },
    subscription: subscriptionSchema,
    name: { type: String, required: true },
    icon: imageSchema,
    cleaning: { type: Boolean, required: true },
  },
  {
    autoCreate: true,
    toJSON: {
      transform: (doc) => {
        return {
          id: doc.id,
          plan: doc.plan,
          subscription: doc.subscription,
          name: doc.name,
          iconUrl: doc.icon
            ? `${linkDomain()}/api/organizations/${doc.id}/icon/${doc.icon.id}`
            : undefined,
          cleaning: doc.cleaning,
        }
      },
    },
  }
)

export const Organization = mongoose.model<OrganizationType>(
  'Organization',
  organizationSchema
)
