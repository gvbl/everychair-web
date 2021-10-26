import bcryptjs from 'bcryptjs'
import { NextFunction, Request, Response } from 'express'
import _ from 'lodash'
import mongoose, { ClientSession } from 'mongoose'
import passport from 'passport'
import Stripe from 'stripe'
import { v4 as uuidv4 } from 'uuid'
import { USER_NOT_FOUND_ERROR } from '../errors'
import { Membership } from '../models/Membership'
import { Plan } from '../models/Plan'
import { Role } from '../models/Role'
import {
  AuthStrategy,
  IUser,
  toAvatarUrl,
  User,
  UserType,
} from '../models/User'
import { timeZoneForAddress } from '../services/timeZone'
import { lastMidnight, missedCleaningNotice } from '../util/date'
import { unpackImage } from '../util/image'
import { toTimeRanges } from '../util/reserve'
import { parseQueryCSV } from '../util/util'
import {
  createConfirmEmail,
  deleteConfirmEmailByUserId,
} from './confirmEmailController'
import {
  createDesk,
  deleteDeskByIdOrFail,
  deleteDesksByLocationId,
  deleteDesksByOrganizationId,
  deleteDesksBySpaceId,
  findDeskByIdOrFail,
  findDesks,
} from './deskController'
import {
  invitationVariables,
  sendCleaningConflict,
  sendCleaningNotices,
  sendEmailConfirmation,
  sendInvitations,
  sendReservationConfirmation,
  sendReservationDayCancellation,
  sendResetPassword,
  sendResetPasswordSuccess,
  sendWelcome,
} from './email'
import {
  createInvitations,
  deleteInvitationByIdOrFail,
  deleteInvitationsByOrganizationId,
  findInvitationByTokenOrFail,
  findInvitations,
  oneWeekExpiration,
} from './invitationController'
import {
  createLocation,
  deleteLocationByIdOrFail,
  deleteLocationsByOrganizationId,
  findLocationByIdOrFail,
  findLocations,
  updateLocationOrFail,
} from './locationController'
import {
  createMembershipPop,
  deleteMembershipByIdOrFail,
  deleteMembershipsByOrganizationIdOrFail,
  deleteMembershipsByUserId,
  disableCleaningByOrganizationId,
  findMembershipByIdAndUpdateOrFail,
  findMembershipOrFail,
  findMembershipsByUserIdPop,
  findMembershipsPop,
  findOwnerMembershipsByUserId,
} from './membershipController'
import {
  createOrganization,
  deleteOrganizationByIdOrFail,
  findOrganizationByIdOrFail,
  updateOrganizationOrFail,
} from './organizationController'
import {
  createReservation,
  deleteReservationByIdOrFail,
  deleteReservationDayByIdOrFail,
  deleteReservationsByDeskId,
  deleteReservationsByLocationId,
  deleteReservationsByOrganizationId,
  deleteReservationsBySpaceId,
  deleteReservationsByUserId,
  findReservationByIdOrFail,
  findReservations,
} from './reservationController'
import {
  createResetPassword,
  deleteResetPasswordByUserId,
  findResetPasswordByTokenOrFail,
  threeHourExpiration,
} from './resetPasswordController'
import {
  createSpace,
  deleteSpaceByIdOrFail,
  deleteSpacesByLocationId,
  deleteSpacesByOrganizationId,
  findSpaces,
  updateSpaceOrFail,
} from './spaceController'
import {
  createUser,
  deleteUserOrFail,
  findUserByIdOrFail,
  findUserOrFail,
  updateUserOrFail,
} from './userController'

const stripe = new Stripe(process.env.STRIPE_API_KEY ?? '', {
  apiVersion: '2020-08-27',
})

// Impl

const deleteOrganizationImpl = async (
  organizationId: string,
  session?: ClientSession
) => {
  await deleteReservationsByOrganizationId(organizationId, session)
  await deleteLocationsByOrganizationId(organizationId, session)
  await deleteSpacesByOrganizationId(organizationId, session)
  await deleteDesksByOrganizationId(organizationId, session)
  await deleteInvitationsByOrganizationId(organizationId, session)
  await deleteMembershipsByOrganizationIdOrFail(organizationId, session)
  await deleteOrganizationByIdOrFail(organizationId, session)
}

const deleteAccountImpl = async (userId: string, session?: ClientSession) => {
  const user = await findUserByIdOrFail(userId)
  await deleteReservationsByUserId(userId, session)
  const ownerMemberships = await findOwnerMembershipsByUserId(userId, session)
  const ownerOrganizationIds = ownerMemberships.map(
    (ownerMembership) => ownerMembership.organization as string
  )
  if (user.customerId) {
    stripe.customers.del(user.customerId)
  }
  for (let i = 0; i < ownerOrganizationIds.length; i++) {
    await deleteOrganizationImpl(ownerOrganizationIds[i], session)
  }
  await deleteMembershipsByUserId(userId, session)
  await deleteUserOrFail(userId, session)
}

// Controller

export const handleErrors = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err) {
    console.error(err)
  }
  const originalUrl: string = req.originalUrl
  if (err === USER_NOT_FOUND_ERROR) {
    req.logOut()
    if (originalUrl === '/') {
      next()
      return
    }
    res.redirect('/')
    return
  }
  next()
}

// User

export const getGoogleSignUpCallback = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  passport.authenticate('google-sign-up', (err: any, user: IUser) => {
    if (err) {
      if (err.name) {
        const origin = req.session?.origin ?? '/signup'
        res.redirect(`${origin}?error=${err.name}`)
        return
      }
      next(err)
      return
    }
    req.logIn(user, (err: any) => {
      if (err) {
        next(err)
        return
      }
      res.redirect(req.session?.redirect ?? '/landing')
    })
  })(req, res, next)
}

export const getGoogleLogInCallback = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  passport.authenticate('google-log-in', (err: any, user: IUser) => {
    if (err) {
      if (err.name) {
        const origin = req.session?.origin ?? '/login'
        res.redirect(`${origin}?error=${err.name}`)
        return
      }
      next(err)
      return
    }
    req.logIn(user, (err: any) => {
      if (err) {
        next(err)
        return
      }
      res.redirect(req.session?.redirect ?? '/landing')
    })
  })(req, res, next)
}

export const getGoogleDeleteAccountCallback = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  passport.authenticate(
    'google-delete-account',
    async (err: any, user: UserType) => {
      if (err) {
        if (err.name) {
          res.redirect(`/settings/delete-account?error=${err.name}`)
          return
        }
        next(err)
        return
      }

      let session: mongoose.ClientSession | undefined = undefined
      try {
        session = await mongoose.startSession()
        session.startTransaction()
        await deleteAccountImpl(user.id, session)
        await session.commitTransaction()
        session.endSession()
      } catch (err: any) {
        if (session) {
          await session.abortTransaction()
        }
        next(err)
        return
      }

      req.logOut()
      res.redirect('/')
    }
  )(req, res, next)
}

export const postSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let session: mongoose.ClientSession | undefined = undefined
  try {
    const email: string = req.body.email
    const password: string = req.body.password

    session = await mongoose.startSession()
    session.startTransaction()

    const hash = await bcryptjs.hash(password, 10)
    const user = await createUser(
      {
        authStrategy: AuthStrategy.LOCAL,
        email: email,
        emailConfirmed: false,
        password: hash,
      },
      session
    )

    const token = uuidv4()

    await createConfirmEmail(
      {
        userId: user.id,
        token: token,
      },
      session
    )

    await sendWelcome(user.email, token)

    await session.commitTransaction()
    session.endSession()
    req.logIn(user, async (err: any) => {
      if (err) {
        throw err
      }
      res.json(user)
    })
  } catch (err: any) {
    next(err)
  }
}

export const postLogIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const email: string = req.body.email

    const user = await findUserOrFail({ email: email })
    req.logIn(user, async (err: any) => {
      if (err) {
        next(err)
        return
      }
      res.json(user)
    })
  } catch (err: any) {
    next(err)
  }
}

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  res.json(req.user)
  next()
}

export const postSendEmailConfirmation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let session: mongoose.ClientSession | undefined = undefined
  try {
    const user = req.user as UserType

    session = await mongoose.startSession()
    session.startTransaction()

    const token = uuidv4()

    await createConfirmEmail(
      {
        userId: user.id,
        token: token,
      },
      session
    )

    await sendEmailConfirmation(user.email, token)

    await session.commitTransaction()
    session.endSession()

    res.status(204).send()
  } catch (err: any) {
    if (session) {
      await session.abortTransaction()
    }
    next(err)
  }
}

export const postConfirmEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let session: mongoose.ClientSession | undefined = undefined
  try {
    const user = req.user as UserType

    session = await mongoose.startSession()
    session.startTransaction()

    user.emailConfirmed = true
    await user.save({ session: session })

    await deleteConfirmEmailByUserId(user.id, session)

    await session.commitTransaction()
    session.endSession()

    res.status(204).send()
  } catch (err: any) {
    if (session) {
      await session.abortTransaction()
    }
    next(err)
  }
}

export const postResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let session: mongoose.ClientSession | undefined = undefined
  try {
    const email: string = req.body.email

    session = await mongoose.startSession()
    session.startTransaction()

    const user = await findUserOrFail({ email: email }, session)
    // todo: password reset entries should also be deleted when user edits their email
    await deleteResetPasswordByUserId(user.id, session)

    const token = uuidv4()

    await createResetPassword(
      {
        userId: user.id,
        token: token,
        expiration: threeHourExpiration(),
      },
      session
    )

    await sendResetPassword(email, token)

    await session.commitTransaction()
    session.endSession()

    res.status(204).send()
  } catch (err: any) {
    if (session) {
      await session.abortTransaction()
    }
    next(err)
  }
}

export const postChangePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let session: mongoose.ClientSession | undefined = undefined
  try {
    const token: string = req.params.token
    const password: string = req.body.password

    session = await mongoose.startSession()
    session.startTransaction()

    const resetPassword = await findResetPasswordByTokenOrFail(token, session)
    const hash = await bcryptjs.hash(password, 10)
    await updateUserOrFail(resetPassword.userId, { password: hash }, session)

    const user = await findUserByIdOrFail(resetPassword.userId, session)
    // todo: password reset entries should also be deleted when user edits their email
    await deleteResetPasswordByUserId(user.id, session)
    await sendResetPasswordSuccess(user.email)

    await session.commitTransaction()
    session.endSession()

    res.status(204).send()
  } catch (err: any) {
    if (session) {
      await session.abortTransaction()
    }
    next(err)
  }
}

export const putUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId: string = req.params.userId
    const firstName: string = req.body.firstName
    const lastName: string = req.body.lastName
    const files = req.files as Express.Multer.File[]
    const newPassword: string = req.body.newPassword

    let modified = {}
    if (firstName) {
      modified = { firstName: firstName }
    }
    if (lastName) {
      modified = { ...modified, lastName: lastName }
    }
    if (files) {
      modified = { avatar: unpackImage(files) }
    }
    if (newPassword) {
      const hash = await bcryptjs.hash(newPassword, 10)
      modified = { password: hash }
    }

    const user = await updateUserOrFail(userId, modified)

    res.send(user)
  } catch (err: any) {
    next(err)
  }
}

export const removeAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId: string = req.params.userId

    await updateUserOrFail(userId, { avatar: undefined })

    res.status(204).send()
  } catch (err: any) {
    next(err)
  }
}

export const getUserAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId: string = req.params.userId

    const user = await findUserByIdOrFail(userId)
    if (!user.avatar) {
      next(new Error('Icon not found'))
      return
    }

    res.set('Content-Type', user.avatar.contentType)
    res.send(user.avatar.data)
  } catch (err: any) {
    next(err)
  }
}

export const postDeleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let session: mongoose.ClientSession | undefined = undefined
  try {
    const userId: string = req.params.userId

    session = await mongoose.startSession()
    session.startTransaction()

    await deleteAccountImpl(userId, session)

    await session.commitTransaction()
    session.endSession()

    res.status(204).send()
  } catch (err: any) {
    if (session) {
      await session.abortTransaction()
    }
    next(err)
  }
}

// Organizations

export const getMemberships = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user as UserType
    const memberships = await findMembershipsByUserIdPop(user.id)
    res.json(memberships)
  } catch (err: any) {
    next(err)
  }
}

export const postOrganizations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let session: mongoose.ClientSession | undefined = undefined
  try {
    const user = req.user as UserType
    const firstName: string | undefined = req.body.firstName
    const lastName: string | undefined = req.body.lastName
    const name: string = req.body.name
    const files = req.files as Express.Multer.File[]
    const cleaning: boolean = req.body.cleaning
    const timeZone: string = req.body.timeZone

    if (firstName && lastName) {
      user.firstName = firstName
      user.lastName = lastName
      await user.save()
    }

    if (!user.customerId) {
      const result = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user.id,
        },
      })
      user.customerId = result.id
      await user.save()
    }

    session = await mongoose.startSession()
    session.startTransaction()

    const organization = await createOrganization(
      {
        plan: Plan.FREE,
        name: name,
        icon: unpackImage(files),
        cleaning: cleaning,
      },
      session
    )

    const location = await createLocation(
      {
        organizationId: organization.id,
        name: 'Main Office',
        timeZone: timeZone,
      },
      session
    )

    const space = await createSpace(
      {
        organizationId: organization.id,
        locationId: location.id,
        name: 'Hybrid Space',
      },
      session
    )
    await createDesk(
      {
        organizationId: organization.id,
        locationId: location.id,
        spaceId: space.id,
        name: 'Shared Desk',
      },
      session
    )

    const membership = await createMembershipPop(
      {
        user: user.id,
        organization: organization.id,
        roles: [Role.STANDARD, Role.ADMIN, Role.OWNER],
      },
      session
    )

    await session.commitTransaction()
    session.endSession()

    res.json(membership)
  } catch (err: any) {
    if (session) {
      await session.abortTransaction()
    }
    next(err)
  }
}

export const putOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let session: mongoose.ClientSession | undefined = undefined
  try {
    const user = req.user as UserType
    const organizationId: string = req.params.organizationId
    const name: string | undefined = req.body.name
    const files = req.files as Express.Multer.File[] | undefined
    const cleaning: boolean | undefined = req.body.cleaning

    session = await mongoose.startSession()
    session.startTransaction()

    let modified = {}
    if (name) {
      modified = { name: name }
    }
    if (files) {
      modified = { icon: unpackImage(files) }
    }
    if (cleaning !== undefined) {
      modified = { cleaning: cleaning }
      if (cleaning) {
        const popAdminCleaningMemberships = await Membership.find({
          organization: organizationId,
          roles: { $in: [Role.ADMIN, Role.CLEANING] },
        }).populate({
          path: 'user',
          model: User,
        })
        const adminCleaningCrewEmails = popAdminCleaningMemberships.map(
          (membership) => (membership.user as UserType).email
        )
        const reservations = await findReservations({
          organizationId: organizationId,
          'timeRanges.start': { $gte: lastMidnight() },
        })
        for (let i = 0; i < reservations.length; i++) {
          const endTimes = reservations[i].timeRanges.map(
            (timeRange) => timeRange.end
          )
          const conflictReservations = await findReservations({
            'timeRanges.start': { $in: endTimes },
          })
          for (let j = 0; j < conflictReservations.length; j++) {
            const conflictUser = await findUserByIdOrFail(
              conflictReservations[j].userId
            )
            const location = await findLocationByIdOrFail(
              reservations[i].locationId
            )
            await sendCleaningConflict(
              user,
              location,
              reservations[i],
              conflictUser,
              conflictReservations[j],
              adminCleaningCrewEmails
            )
          }
        }
      }
    }

    const organization = await updateOrganizationOrFail(
      organizationId,
      modified,
      session
    )

    if (cleaning !== undefined && !cleaning) {
      await disableCleaningByOrganizationId(organizationId, session)
    }

    await session.commitTransaction()
    session.endSession()

    res.send(organization)
  } catch (err: any) {
    if (session) {
      await session.abortTransaction()
    }
    next(err)
  }
}

export const getOrganizationIcon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizationId: string = req.params.organizationId
    const organization = await findOrganizationByIdOrFail(organizationId)
    if (!organization.icon) {
      next(new Error('Icon not found'))
      return
    }
    res.set('Content-Type', organization.icon.contentType)
    res.send(organization.icon.data)
  } catch (err: any) {
    next(err)
  }
}

export const deleteOrganizationIcon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizationId: string = req.params.organizationId

    await updateOrganizationOrFail(organizationId, { icon: undefined })

    res.status(204).send()
  } catch (err: any) {
    next(err)
  }
}

export const deleteOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let session: mongoose.ClientSession | undefined = undefined
  try {
    const organizationId: string = req.params.organizationId

    session = await mongoose.startSession()
    session.startTransaction()

    await deleteOrganizationImpl(organizationId, session)

    await session.commitTransaction()
    session.endSession()

    res.status(204).send()
  } catch (err: any) {
    if (session) {
      await session.abortTransaction()
    }
    next(err)
  }
}

// Invitations

export const getInvitations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizationIds: string[] = parseQueryCSV(
      req.query.organizationIds as string
    )
    const invitations = await findInvitations(organizationIds)
    res.json(invitations)
  } catch (err: any) {
    next(err)
  }
}

export const postInvitations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizationId: string = req.params.organizationId
    const emails: string[] = _.uniq(req.body.emails)

    const organization = await findOrganizationByIdOrFail(organizationId)

    const expiration = oneWeekExpiration()
    const templates = emails.map((email) => {
      return {
        organization: organization.id,
        email: email,
        token: uuidv4(),
        expiration: expiration,
      }
    })
    const invitations = await createInvitations(templates)

    const variables = invitationVariables(invitations)
    await sendInvitations(emails, organization.name, variables)

    res.json(invitations)
  } catch (err: any) {
    next(err)
  }
}

export const postRsvp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let session: mongoose.ClientSession | undefined = undefined
  try {
    const user = req.user as UserType
    const token: string = req.params.token

    session = await mongoose.startSession()
    session.startTransaction()

    if (!user.emailConfirmed) {
      user.emailConfirmed = true
      await user.save({ session: session })
    }

    const invitation = await findInvitationByTokenOrFail(token, session)
    const organizationId = invitation.organization
    const membership = await createMembershipPop(
      {
        user: user.id,
        organization: organizationId,
        roles: [Role.STANDARD],
      },
      session
    )

    await deleteInvitationByIdOrFail(invitation.id, session)

    await session.commitTransaction()
    session.endSession()

    res.json(membership)
  } catch (err: any) {
    if (session) {
      await session.abortTransaction()
    }
    next(err)
  }
}

export const deleteInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const invitationId: string = req.params.invitationId
    await deleteInvitationByIdOrFail(invitationId)
    res.status(204).send()
  } catch (err: any) {
    next(err)
  }
}

// Members

export const getMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizationIds: string[] = parseQueryCSV(
      req.query.organizationIds as string
    )

    const memberships = await findMembershipsPop(organizationIds)
    const members = memberships.map((membership) => {
      const user = membership.user as UserType
      return {
        membershipId: membership.id,
        organizationId: membership.organization,
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: membership.roles,
        avatarUrl: toAvatarUrl(user),
      }
    })
    res.json(members)
  } catch (err: any) {
    next(err)
  }
}

export const deleteMembership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let session: mongoose.ClientSession | undefined = undefined
  try {
    const membershipId: string = req.params.membershipId

    session = await mongoose.startSession()
    session.startTransaction()

    await deleteMembershipByIdOrFail(membershipId, session)

    await session.commitTransaction()
    session.endSession()

    res.status(204).send()
  } catch (err: any) {
    if (session) {
      await session.abortTransaction()
    }
    next(err)
  }
}

export const putMembership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const membershipId: string = req.params.membershipId
    const rawRoles: string[] = req.body.roles
    const roles = rawRoles.map((rawRole) => Role[rawRole as keyof typeof Role])

    await findMembershipByIdAndUpdateOrFail(membershipId, {
      roles: roles,
    })
    res.status(204).send()
  } catch (err: any) {
    next(err)
  }
}

// Locations

export const getLocations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizationIds: string[] = parseQueryCSV(
      req.query.organizationIds as string
    )
    const locations = await findLocations(organizationIds)
    res.json(locations)
  } catch (err: any) {
    next(err)
  }
}

export const postLocations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizationId: string = req.params.organizationId
    const name: string = req.body.name
    const files = req.files as Express.Multer.File[]
    const street: string | undefined = req.body.street
    const city: string | undefined = req.body.city
    const state: string | undefined = req.body.state
    const zip: string | undefined = req.body.zip
    const clientTimeZone: string = req.body.timeZone
    let timeZone = clientTimeZone

    if (street) {
      const addressTimeZone = await timeZoneForAddress(street, city, state, zip)
      if (addressTimeZone) {
        timeZone = addressTimeZone
      }
    }

    const location = await createLocation({
      organizationId: organizationId,
      name: name,
      timeZone: timeZone,
      image: unpackImage(files),
      address: street
        ? {
            street: street,
            city: city,
            state: state,
            zip: zip,
          }
        : undefined,
    })
    res.json(location)
  } catch (err: any) {
    next(err)
  }
}

export const putLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const locationId: string = req.params.locationId
    const name: string = req.body.name
    const files = req.files as Express.Multer.File[] | undefined
    const street: string | undefined = req.body.street
    const city: string | undefined = req.body.city
    const state: string | undefined = req.body.state
    const zip: string | undefined = req.body.zip

    let modified = {}
    if (name) {
      modified = { name: name }
    }
    if (files) {
      modified = { image: unpackImage(files) }
    }
    if (street) {
      let timeZone = await timeZoneForAddress(street, city, state, zip)
      if (timeZone) {
        modified = {
          timeZone: timeZone,
        }
      }
      modified = {
        ...modified,
        address: {
          street: street,
          city: city,
          state: state,
          zip: zip,
        },
      }
    }

    const location = await updateLocationOrFail(locationId, modified)

    res.send(location)
  } catch (err: any) {
    next(err)
  }
}

export const deleteLocationImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const locationId: string = req.params.locationId

    await updateLocationOrFail(locationId, { image: undefined })

    res.status(204).send()
  } catch (err: any) {
    next(err)
  }
}

export const deleteLocationAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const locationId: string = req.params.locationId

    await updateLocationOrFail(locationId, { address: undefined })

    res.status(204).send()
  } catch (err: any) {
    next(err)
  }
}

export const deleteLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let session: mongoose.ClientSession | undefined = undefined
  try {
    const locationId: string = req.params.locationId

    session = await mongoose.startSession()
    session.startTransaction()

    await deleteReservationsByLocationId(locationId, session)
    await deleteSpacesByLocationId(locationId, session)
    await deleteDesksByLocationId(locationId, session)
    await deleteLocationByIdOrFail(locationId, session)

    await session.commitTransaction()
    session.endSession()

    res.status(204).send()
  } catch (err: any) {
    if (session) {
      await session.abortTransaction()
    }
    next(err)
  }
}

export const getLocationImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const locationId: string = req.params.locationId
    const location = await findLocationByIdOrFail(locationId)
    if (!location.image) {
      next(new Error('Image not found'))
      return
    }
    res.set('Content-Type', location.image.contentType)
    res.send(location.image.data)
  } catch (err: any) {
    next(err)
  }
}

// Spaces

export const getSpaces = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizationIds: string[] = parseQueryCSV(
      req.query.organizationIds as string
    )
    const spaces = await findSpaces(organizationIds)
    res.json(spaces)
  } catch (err: any) {
    next(err)
  }
}

export const postSpaces = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizationId: string = req.params.organizationId
    const locationId: string = req.params.locationId
    const name: string = req.body.name
    const space = await createSpace({
      organizationId: organizationId,
      locationId: locationId,
      name: name,
    })
    res.json(space)
  } catch (err: any) {
    next(err)
  }
}

export const putSpace = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const spaceId: string = req.params.spaceId
    const name: string = req.body.name

    await updateSpaceOrFail(spaceId, { name: name })

    res.status(204).send()
  } catch (err: any) {
    next(err)
  }
}

export const deleteSpace = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let session: mongoose.ClientSession | undefined = undefined
  try {
    const spaceId: string = req.params.spaceId

    session = await mongoose.startSession()
    session.startTransaction()

    await deleteReservationsBySpaceId(spaceId, session)
    await deleteDesksBySpaceId(spaceId, session)
    await deleteSpaceByIdOrFail(spaceId, session)

    await session.commitTransaction()
    session.endSession()

    res.status(204).send()
  } catch (err: any) {
    if (session) {
      await session.abortTransaction()
    }
    next(err)
  }
}

// Desks

export const getDesks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizationIds: string[] = parseQueryCSV(
      req.query.organizationIds as string
    )
    const desks = await findDesks(organizationIds)
    res.json(desks)
  } catch (err: any) {
    next(err)
  }
}

export const postDesks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizationId: string = req.params.organizationId
    const locationId: string = req.params.locationId
    const spaceId: string = req.params.spaceId
    const name: string = req.body.name
    const files = req.files as Express.Multer.File[]
    const desk = await createDesk({
      organizationId: organizationId,
      locationId: locationId,
      spaceId: spaceId,
      name: name,
      image: unpackImage(files),
    })
    res.json(desk)
  } catch (err: any) {
    next(err)
  }
}

export const deleteDesk = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let session: mongoose.ClientSession | undefined = undefined
  try {
    const deskId: string = req.params.deskId

    session = await mongoose.startSession()
    session.startTransaction()

    await deleteReservationsByDeskId(deskId, session)
    await deleteDeskByIdOrFail(deskId, session)

    await session.commitTransaction()
    session.endSession()

    res.status(204).send()
  } catch (err: any) {
    if (session) {
      await session.abortTransaction()
    }
    next(err)
  }
}

export const getDeskImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deskId: string = req.params.deskId
    const desk = await findDeskByIdOrFail(deskId)
    if (!desk.image) {
      next(new Error('Image not found'))
      return
    }
    res.set('Content-Type', desk.image.contentType)
    res.send(desk.image.data)
  } catch (err: any) {
    next(err)
  }
}

// Reservations

export const getReservations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizationIds: string[] = parseQueryCSV(
      req.query.organizationIds as string
    )
    const reservations = await findReservations({
      organizationId: { $in: organizationIds },
      'timeRanges.start': { $gte: lastMidnight() },
    })

    res.json(reservations)
  } catch (err: any) {
    next(err)
  }
}

export const postReservations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user as UserType
    const organizationId: string = req.params.organizationId
    const locationId: string = req.params.locationId
    const spaceId: string = req.params.spaceId
    const deskId: string = req.params.deskId
    const days: string[] = req.body.days
    const startTime = new Date(req.body.startTime as string)
    const endTime = new Date(req.body.endTime as string)

    const timeRanges = toTimeRanges(
      days.map((day) => new Date(day)),
      startTime,
      endTime
    )
    timeRanges.sort((a, b) => a.start.getTime() - b.start.getTime())

    const membership = await findMembershipOrFail(organizationId, user.id)

    const reservation = await createReservation({
      userId: user.id,
      membershipId: membership.id,
      organizationId: organizationId,
      locationId: locationId,
      spaceId: spaceId,
      deskId: deskId,
      timeRanges: timeRanges,
    })

    const location = await findLocationByIdOrFail(locationId)
    const desk = await findDeskByIdOrFail(deskId)
    await sendReservationConfirmation(user.email, reservation, location, desk)

    const organization = await findOrganizationByIdOrFail(organizationId)
    if (
      organization.cleaning &&
      missedCleaningNotice(timeRanges[0].end) &&
      reservation.timeRanges[0].id
    ) {
      await sendCleaningNotices(
        [user.email],
        reservation.id,
        location,
        desk,
        reservation.timeRanges[0]
      )
    }

    res.json(reservation)
  } catch (err: any) {
    next(err)
  }
}

export const deleteReservationDay = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user as UserType
    const reservationId: string = req.params.reservationId
    const timeRangeId: string = req.params.timeRangeId

    const reservation = await findReservationByIdOrFail(reservationId)
    const location = await findLocationByIdOrFail(reservation.locationId)
    const desk = await findDeskByIdOrFail(reservation.deskId)
    const timeRange = reservation.timeRanges.find(
      (timeRange) => timeRange.id === timeRangeId
    )
    if (!timeRange) {
      next(new Error('Time range not found'))
      return
    }
    await deleteReservationDayByIdOrFail(reservationId, timeRangeId)

    await sendReservationDayCancellation(user.email, location, desk, timeRange)

    res.status(204).send()
  } catch (err: any) {
    next(err)
  }
}

export const deleteReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user as UserType
    const reservationId: string = req.params.reservationId

    const reservation = await findReservationByIdOrFail(reservationId)
    const location = await findLocationByIdOrFail(reservation.locationId)
    const desk = await findDeskByIdOrFail(reservation.deskId)
    const timeRange = reservation.timeRanges[0]
    await deleteReservationByIdOrFail(reservationId)

    await sendReservationDayCancellation(user.email, location, desk, timeRange)

    res.status(204).send()
  } catch (err: any) {
    next(err)
  }
}
