// partial sync with client side src/models/api/PlanInfo.ts

import { Plan } from './Plan'

export const PlanToLevelMap = {
  [Plan.FREE]: 0,
  [Plan.STARTER]: 1,
  [Plan.PROFESSIONAL]: 2,
  [Plan.ENTERPRISE]: 3,
}

const TestPlanToPriceIdMap: Record<Plan, string | undefined> = {
  [Plan.FREE]: undefined,
  [Plan.STARTER]: 'price_1IDqiyD9acIe7FmFRQDT1lvU',
  [Plan.PROFESSIONAL]: 'price_1IDqjvD9acIe7FmFoWFcESuy',
  [Plan.ENTERPRISE]: 'price_1IDqkVD9acIe7FmFssGH4yjg',
}

const TestPriceIdToPlanMap: Record<string, Plan> = {
  ['price_1IDqiyD9acIe7FmFRQDT1lvU']: Plan.STARTER,
  ['price_1IDqjvD9acIe7FmFoWFcESuy']: Plan.PROFESSIONAL,
  ['price_1IDqkVD9acIe7FmFssGH4yjg']: Plan.ENTERPRISE,
}

const ProductionPlanToPriceIdMap: Record<Plan, string | undefined> = {
  [Plan.FREE]: undefined,
  [Plan.STARTER]: 'price_1IPt9ED9acIe7FmFSybLukFW',
  [Plan.PROFESSIONAL]: 'price_1IPt9sD9acIe7FmFUkF1Hr4d',
  [Plan.ENTERPRISE]: 'price_1IPtADD9acIe7FmFmeX5HXMe',
}

const ProductionPriceIdToPlanMap: Record<string, Plan> = {
  ['price_1IPt9ED9acIe7FmFSybLukFW']: Plan.STARTER,
  ['price_1IPt9sD9acIe7FmFUkF1Hr4d']: Plan.PROFESSIONAL,
  ['price_1IPtADD9acIe7FmFmeX5HXMe']: Plan.ENTERPRISE,
}

export const planToPriceId = (plan: Plan) => {
  if (process.env.NODE_ENV === 'production') {
    return ProductionPlanToPriceIdMap[plan]
  }
  return TestPlanToPriceIdMap[plan]
}

export const priceIdToPlan = (priceId: string) => {
  if (process.env.NODE_ENV === 'production') {
    return ProductionPriceIdToPlanMap[priceId]
  }
  return TestPriceIdToPlanMap[priceId]
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
