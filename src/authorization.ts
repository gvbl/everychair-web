import { NextFunction, Request, Response } from 'express'
import { countDesks, findDeskById } from './controllers/deskController'
import {
  countInvitations,
  findInvitationById,
} from './controllers/invitationController'
import {
  countLocations,
  findLocationById,
} from './controllers/locationController'
import {
  countMemberships,
  findMembership,
  findMembershipById,
  findMembershipsByUserId,
  findMembershipsByUserIdPop,
} from './controllers/membershipController'
import { findOrganizationByIdOrFail } from './controllers/organizationController'
import { findReservationById } from './controllers/reservationController'
import { countSpaces, findSpaceById } from './controllers/spaceController'
import { OrganizationType } from './models/Organization'
import { Plan } from './models/Plan'
import {
  PlanToDesksQuotaMap,
  PlanToLevelMap,
  PlanToLocationsQuotaMap,
  PlanToMembersQuotaMap,
  PlanToSpacesQuotaMap,
} from './models/PlanInfo'
import { Role } from './models/Role'
import { SubscriptionStatus } from './models/SubscriptionStatus'
import { AuthStrategy, UserType } from './models/User'
import { verifyCaptcha } from './services/captcha'
import { extractIp, parseQueryCSV } from './util/util'

export const isNotAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  if (user) {
    res.status(403).send()
    return
  }
  next()
}

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  if (!user) {
    res.status(403).send()
    return
  }
  next()
}

const isMember = async (organizationId: string, userId: string) => {
  const membership = await findMembership(organizationId, userId)
  return !!membership
}

const isAdmin = async (organizationId: string, userId: string) => {
  const membership = await findMembership(organizationId, userId)
  return membership && membership.roles.includes(Role.ADMIN)
}

const isOwner = async (organizationId: string, userId: string) => {
  const membership = await findMembership(organizationId, userId)
  return membership && membership.roles.includes(Role.OWNER)
}

export const authorizeSelf = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  const userId: string = req.params.userId
  if (userId !== user.id) {
    res.status(401).send()
    return
  }
  next()
}

export const authorizeEmailConfirmed = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  if (!user.emailConfirmed) {
    res.status(401).send()
    return
  }
  next()
}

export const authorizeAuthLocal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  if (user.authStrategy !== AuthStrategy.LOCAL) {
    res.status(401).send()
    return
  }
  next()
}

export const authorizeAuthGoogle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  if (user.authStrategy !== AuthStrategy.GOOGLE) {
    res.status(401).send()
    return
  }
  next()
}

export const authorizeMutualMembership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  const userId: string = req.params.userId

  const selfMemberOrganizations = await findMembershipsByUserId(user.id)
  const selfMemberOrganizationIds = selfMemberOrganizations.map(
    (selfMemberOrganization) => selfMemberOrganization.organization as string
  )
  const targetMemberOrganzations = await findMembershipsByUserId(userId)
  const targetMemberOrganizationIds = targetMemberOrganzations.map(
    (targetMemberOrganzation) => targetMemberOrganzation.organization as string
  )

  const mutualMemberOrganizationIds = selfMemberOrganizationIds.filter(
    (selfMemberOrganizationId) =>
      targetMemberOrganizationIds.includes(selfMemberOrganizationId)
  )

  if (mutualMemberOrganizationIds.length === 0) {
    res.status(401).send()
    return
  }
  next()
}

export const authorizeDeleteMembership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  const membershipId: string = req.params.membershipId
  const targetMembership = await findMembershipById(membershipId)
  if (!targetMembership) {
    res.status(404).send()
    return
  }
  const membership = await findMembership(
    targetMembership.organization as string,
    user.id
  )
  if (!membership) {
    res.status(404).send()
    return
  }
  const isTargetAdmin = await isAdmin(
    targetMembership.organization as string,
    user.id
  )
  const isMembershipOwner = targetMembership.roles.includes(Role.OWNER)
  if (
    !isTargetAdmin ||
    (isTargetAdmin && targetMembership.user === user.id) ||
    isMembershipOwner
  ) {
    res.status(401).send()
    return
  }
  next()
}

export const authorizeUpdateMembershipRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  const membershipId: string = req.params.membershipId
  const roles: string[] = req.body.roles
  const targetMembership = await findMembershipById(membershipId)
  if (!targetMembership) {
    res.status(404).send()
    return
  }
  const membership = await findMembership(
    targetMembership.organization as string,
    user.id
  )
  if (!membership) {
    res.status(404).send()
    return
  }
  const isTargetAdmin = await isAdmin(
    targetMembership.organization as string,
    user.id
  )
  if (!isTargetAdmin) {
    res.status(401).send()
    return
  }
  if (targetMembership.user === user.id && !roles.includes(Role.ADMIN)) {
    res.status(401).send()
    return
  }
  if (
    targetMembership.roles.includes(Role.OWNER) &&
    !roles.includes(Role.OWNER)
  ) {
    res.status(401).send()
    return
  }
  if (
    targetMembership.roles.includes(Role.OWNER) &&
    !roles.includes(Role.ADMIN)
  ) {
    res.status(401).send()
    return
  }
  if (
    !targetMembership.roles.includes(Role.OWNER) &&
    roles.includes(Role.OWNER)
  ) {
    res.status(401).send()
    return
  }
  next()
}

export const authorizeAdminOrganizations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  const organizationIds: string[] = parseQueryCSV(
    req.query.organizationIds as string
  )

  const nonAdminIds: string[] = []
  for (let i = 0; i < organizationIds.length; i++) {
    const organizationId = organizationIds[i]
    if (!(await isAdmin(organizationId, user.id))) {
      nonAdminIds.push(organizationId)
    }
  }

  if (nonAdminIds.length > 0) {
    res.status(401).send()
    return
  }
  next()
}

export const authorizeAdminOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  const organizationId: string = req.params.organizationId
  if (!(await isAdmin(organizationId, user.id))) {
    res.status(401).send()
    return
  }
  next()
}

export const authorizeOwnerOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  const organizationId: string = req.params.organizationId
  if (!(await isOwner(organizationId, user.id))) {
    res.status(401).send()
    return
  }
  next()
}

export const authorizeAdminInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  const invitationId: string = req.params.invitationId
  const invitation = await findInvitationById(invitationId)
  if (!invitation) {
    res.status(404).send()
    return
  }
  if (!(await isAdmin(invitation.organization as string, user.id))) {
    res.status(401).send()
    return
  }
  next()
}

export const authorizeMemberOrganizations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  const organizationIds: string[] = parseQueryCSV(
    req.query.organizationIds as string
  )

  const nonMembershipIds: string[] = []
  for (let i = 0; i < organizationIds.length; i++) {
    const organizationId = organizationIds[i]
    if (!(await isMember(organizationId, user.id))) {
      nonMembershipIds.push(organizationId)
    }
  }

  if (nonMembershipIds.length > 0) {
    res.status(401).send()
    return
  }
  next()
}

export const authorizeMemberOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  const organizationId: string = req.params.organizationId
  if (!(await isMember(organizationId, user.id))) {
    res.status(401).send()
    return
  }
  next()
}

export const authorizeAdminLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  const locationId: string = req.params.locationId
  const location = await findLocationById(locationId)
  if (!location) {
    res.status(404).send()
    return
  }
  if (!(await isAdmin(location.organizationId, user.id))) {
    res.status(401).send()
    return
  }
  next()
}

export const authorizeMemberLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  const locationId: string = req.params.locationId
  const location = await findLocationById(locationId)
  if (!location) {
    res.status(404).send()
    return
  }
  if (await !isMember(location.organizationId, user.id)) {
    res.status(401).send()
    return
  }
  next()
}

export const authorizeAdminSpace = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  const spaceId: string = req.params.spaceId
  const space = await findSpaceById(spaceId)
  if (!space) {
    res.status(404).send()
    return
  }
  if (!(await isAdmin(space.organizationId, user.id))) {
    res.status(401).send()
    return
  }
  next()
}

export const authorizeAdminDesk = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  const deskId: string = req.params.deskId
  const desk = await findDeskById(deskId)
  if (!desk) {
    res.status(404).send()
    return
  }
  if (!(await isAdmin(desk.organizationId, user.id))) {
    res.status(401).send()
    return
  }
  next()
}

export const authorizeMemberDesk = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  const deskId: string = req.params.deskId
  const desk = await findDeskById(deskId)
  if (!desk) {
    res.status(404).send()
    return
  }
  if (await !isMember(desk.organizationId, user.id)) {
    res.status(401).send()
    return
  }
  next()
}

export const authorizeCreatorReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  const reservationId: string = req.params.reservationId
  const reservation = await findReservationById(reservationId)
  if (!reservation) {
    res.status(404).send()
    return
  }
  if (reservation.userId !== user.id) {
    res.status(401).send()
    return
  }
  next()
}

// quotas

export const authorizeFreeQuota = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  const rawPlan = req.body.plan

  const plan = rawPlan ? Plan[rawPlan as keyof typeof Plan] : Plan.FREE

  const memberships = await findMembershipsByUserIdPop(user.id)
  const freePlansCount = memberships.filter(
    (membership) =>
      membership.roles.includes(Role.OWNER) &&
      (membership.organization as OrganizationType).plan === Plan.FREE
  ).length
  if (plan === Plan.FREE && freePlansCount > 0) {
    res.status(401).send()
    return
  }
  next()
}

export const authorizeMembersQuota = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const organizationId: string = req.params.organizationId
  const emails: string[] = req.body.emails

  const organization = await findOrganizationByIdOrFail(organizationId)
  const membersQuota = PlanToMembersQuotaMap[organization.plan]

  const membershipsCount = await countMemberships(organizationId)
  const invitationsCount = await countInvitations(organizationId)

  if (membershipsCount + invitationsCount + emails.length > membersQuota) {
    res.status(401).send()
    return
  }
  next()
}

export const authorizeLocationsQuota = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const organizationId: string = req.params.organizationId

  const organization = await findOrganizationByIdOrFail(organizationId)
  const locationsQuota = PlanToLocationsQuotaMap[organization.plan]

  const locationsCount = await countLocations(organizationId)

  if (locationsCount >= locationsQuota) {
    res.status(401).send()
    return
  }
  next()
}

export const authorizeSpacesQuota = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const organizationId: string = req.params.organizationId

  const organization = await findOrganizationByIdOrFail(organizationId)
  const spacesQuota = PlanToSpacesQuotaMap[organization.plan]

  const spacesCount = await countSpaces(organizationId)

  if (spacesCount >= spacesQuota) {
    res.status(401).send()
    return
  }
  next()
}

export const authorizeDesksQuota = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const organizationId: string = req.params.organizationId

  const organization = await findOrganizationByIdOrFail(organizationId)
  const desksQuota = PlanToDesksQuotaMap[organization.plan]

  const desksCount = await countDesks(organizationId)

  if (desksCount >= desksQuota) {
    res.status(401).send()
    return
  }
  next()
}

export const authorizePaid = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const organizationId: string = req.params.organizationId

  const organization = await findOrganizationByIdOrFail(organizationId)

  if (
    organization.subscription &&
    organization.subscription.status !== SubscriptionStatus.PAID
  ) {
    res.status(401).send()
    return
  }

  next()
}

export const authorizeQuotas = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  const organizationId: string = req.params.organizationId
  const rawPlan: string = req.body.plan

  const organization = await findOrganizationByIdOrFail(organizationId)

  const plan = rawPlan ? Plan[rawPlan as keyof typeof Plan] : Plan.FREE
  if (PlanToLevelMap[plan] > PlanToLevelMap[organization.plan]) {
    next()
    return
  }

  const memberships = await findMembershipsByUserIdPop(user.id)
  const freePlansCount = memberships.filter(
    (membership) =>
      membership.roles.includes(Role.OWNER) &&
      (membership.organization as OrganizationType).plan === Plan.FREE
  ).length
  if (plan === Plan.FREE && freePlansCount > 0) {
    res.status(401).send()
    return
  }

  const membershipsCount = await countMemberships(organizationId)
  const invitationsCount = await countInvitations(organizationId)
  if (membershipsCount + invitationsCount > PlanToMembersQuotaMap[plan]) {
    res.status(401).send()
    return
  }

  const locationsCount = await countLocations(organizationId)
  if (locationsCount > PlanToLocationsQuotaMap[plan]) {
    res.status(401).send()
    return
  }

  const spacesCount = await countSpaces(organizationId)
  if (spacesCount > PlanToSpacesQuotaMap[plan]) {
    res.status(401).send()
    return
  }

  const desksCount = await countDesks(organizationId)
  if (desksCount > PlanToDesksQuotaMap[plan]) {
    res.status(401).send()
    return
  }

  next()
}

const authorizeCaptcha = (action: string) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const captcha: string = req.body.captcha

    const ip = extractIp(req)

    const isVerified = await verifyCaptcha(action, captcha, ip)
    if (!isVerified) {
      res.status(401).send()
      return
    }

    next()
  }
}

export const authorizeSignUpCaptcha = authorizeCaptcha('signup_submit')

export const authorizeLogInCaptcha = authorizeCaptcha('login_submit')
