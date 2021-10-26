// partial sync with server side src/models/PlanInfo.ts

import { Plan } from './Plan'

export const PlanToLevelMap = {
  [Plan.FREE]: 0,
  [Plan.STARTER]: 1,
  [Plan.PROFESSIONAL]: 2,
  [Plan.ENTERPRISE]: 3,
}

export const PlanToDollarPriceMap = {
  [Plan.FREE]: '$0',
  [Plan.STARTER]: '$99.99',
  [Plan.PROFESSIONAL]: '$199.99',
  [Plan.ENTERPRISE]: '$399.99',
}

const FreeDetails = [
  '5 Desks',
  '20 Members',
  '1 Location',
  'Cleaning',
  'Email support',
]

const StarterDetails = [
  '10 Desks',
  '50 Members',
  '2 Locations',
  'Cleaning',
  'Email support',
]

const ProfessionalDetails = [
  '30 Desks',
  '150 Members',
  '10 Locations',
  'Cleaning',
  'Email support',
]

const EnterpriseDetails = [
  '120 Desks',
  '600 Members',
  '100 Locations',
  'Cleaning',
  'Priority email support',
]

export const PlanToDetailsMap = {
  [Plan.FREE]: FreeDetails,
  [Plan.STARTER]: StarterDetails,
  [Plan.PROFESSIONAL]: ProfessionalDetails,
  [Plan.ENTERPRISE]: EnterpriseDetails,
}

export const PlanToMembersQuotaMap = {
  [Plan.FREE]: 20,
  [Plan.STARTER]: 50,
  [Plan.PROFESSIONAL]: 150,
  [Plan.ENTERPRISE]: 600,
}

export const PlanToLocationsQuotaMap = {
  [Plan.FREE]: 1,
  [Plan.STARTER]: 2,
  [Plan.PROFESSIONAL]: 15,
  [Plan.ENTERPRISE]: 100,
}

export const PlanToDesksQuotaMap = {
  [Plan.FREE]: 5,
  [Plan.STARTER]: 10,
  [Plan.PROFESSIONAL]: 30,
  [Plan.ENTERPRISE]: 120,
}

export const PlanToSpacesQuotaMap = PlanToDesksQuotaMap
