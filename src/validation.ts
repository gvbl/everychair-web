import bcryptjs from 'bcryptjs'
import { NextFunction, Request, Response } from 'express'
import {
  check,
  CustomValidator,
  param,
  ValidationChain,
  validationResult,
} from 'express-validator'
import { ConfirmEmail } from './models/ConfirmEmail'
import { Desk } from './models/Desk'
import { Invitation } from './models/Invitation'
import { Membership } from './models/Membership'
import { Role } from './models/Role'
import { Organization } from './models/Organization'
import { Reservation } from './models/Reservation'
import { ResetPassword } from './models/ResetPassword'
import { AuthStrategy, User, UserType } from './models/User'
import { isUpcomingDay, isUpcomingTime, lastMidnight, now } from './util/date'
import { generateDeskConflictMap } from './util/reserve'
import StateCodes from './util/StateCodes'
import { joinConj } from './util/util'
import { Plan } from './models/Plan'
import TimeZones from './models/TimeZones'

export const validate = (validations: ValidationChain[]) => async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await Promise.all(
    validations.map((validation: ValidationChain) => validation.run(req))
  )

  const errors = validationResult(req)
  if (errors.isEmpty()) {
    next()
    return
  }

  res.status(400).json({ errors: errors.array() })
}

const isExpired = (date: Date) => {
  return now().getTime() > date.getTime()
}

const isEmailInUse = (value: string) => {
  return User.findOne({
    email: value,
  }).then((user: UserType | null) => {
    if (user) {
      return Promise.reject('This email is already associated with an account')
    }
    return Promise.resolve()
  })
}

const isEmailGoogle = (value: string) => {
  return User.findOne({
    email: value,
    authStrategy: AuthStrategy.GOOGLE,
  }).then((user: UserType | null) => {
    if (user) {
      return Promise.reject('This email is associated with a Google account')
    }
    return Promise.resolve()
  })
}

const isEmailNotFoundLocal = (value: string) => {
  return User.findOne({
    email: value,
    authStrategy: AuthStrategy.LOCAL,
  }).then((user: UserType | null) => {
    if (!user) {
      return Promise.reject('No account associated with this email')
    }
    return Promise.resolve()
  })
}

const isPasswordCorrectImpl = async (user: UserType, password: string) => {
  if (!user.password) {
    return Promise.reject('Invalid password')
  }
  const success = await bcryptjs.compare(password, user.password)
  if (!success) {
    return Promise.reject('Invalid password')
  }
  return Promise.resolve()
}

const isPasswordCorrect: CustomValidator = async (value, { req }) => {
  const email: string = req.body.email
  const password: string = value

  const user = await User.findOne({
    email: email,
    authStrategy: AuthStrategy.LOCAL,
  }).then((user: UserType | null) => {
    if (!user) {
      return Promise.reject('Invalid password')
    }
    return Promise.resolve(user)
  })

  return await isPasswordCorrectImpl(user, password)
}

const isCurrentPasswordCorrect: CustomValidator = async (value, { req }) => {
  if (!req.params) {
    return Promise.reject("Missing 'userId' parameter")
  }
  const userId: string = req.params.userId
  const password: string = value

  const user = await User.findById(userId).then((user: UserType | null) => {
    if (!user) {
      return Promise.reject('Invalid password')
    }
    return Promise.resolve(user)
  })

  return await isPasswordCorrectImpl(user, password)
}

const isFirstNameRequired: CustomValidator = async (value, { req }) => {
  const user = req.user as UserType
  if (!user.firstName && !value) {
    return Promise.reject('First name is required')
  }
  return Promise.resolve()
}

const isLastNameRequired: CustomValidator = async (value, { req }) => {
  const user = req.user as UserType
  if (!user.lastName && !value) {
    return Promise.reject('Last name is required')
  }
  return Promise.resolve()
}

const hasDuplicateMembers: CustomValidator = async (value, { req }) => {
  if (!req.params) {
    return Promise.reject("Missing 'organizationId' parameter")
  }
  const organizationId: string = req.params.organizationId
  const emails: string[] = value

  const popExistingMemberships = await Membership.find({
    organization: organizationId,
  }).populate({ path: 'user', model: User })
  const membersEmails = popExistingMemberships.map((membership) => {
    const user = membership.user as UserType
    return user.email
  })
  const duplicates = emails.filter((email) => membersEmails.includes(email))
  if (duplicates.length === 1) {
    return Promise.reject(`${duplicates[0]} is already a member`)
  } else if (duplicates.length > 1) {
    return Promise.reject(
      `${joinConj(duplicates, ', ', 'and')} are already members`
    )
  }
  return Promise.resolve()
}

const hasDuplicateInvitations: CustomValidator = async (value, { req }) => {
  if (!req.params) {
    return Promise.reject("Missing 'organizationId' parameter")
  }
  const organizationId: string = req.params.organizationId
  const emails: string[] = value
  const invitations = await Invitation.find({ organization: organizationId })
  const invitationsEmails = invitations.map((invitation) => invitation.email)
  const duplicates = emails.filter((email) => invitationsEmails.includes(email))
  if (duplicates.length === 1) {
    return Promise.reject(`${duplicates[0]} has already received an invitation`)
  } else if (duplicates.length > 1) {
    return Promise.reject(
      `${joinConj(duplicates, ', ', 'and')} have already received invitations`
    )
  }
  return Promise.resolve()
}

const isValidInvitation: CustomValidator = async (value, { req }) => {
  const token: string = value
  const user = req.user as UserType

  const invitation = await Invitation.findOne({ token: token })

  if (!invitation) {
    return Promise.reject('Invitation not found')
  }
  if (invitation.email !== user.email) {
    return Promise.reject('Account email and invitation email do not match')
  }
  if (isExpired(invitation.expiration)) {
    return Promise.reject('Invitation has expired')
  }
  return Promise.resolve()
}

const isValidConfirmEmailToken: CustomValidator = async (value, { req }) => {
  const token: string = value
  const user = req.user as UserType

  const confirmEmail = await ConfirmEmail.findOne({ token: token })
  if (!confirmEmail) {
    return Promise.reject('Confirm token not found')
  }
  if (confirmEmail.userId !== user.id) {
    return Promise.reject('Account email and confirm email do not match')
  }
  return Promise.resolve()
}

const isValidResetPasswordToken: CustomValidator = async (value) => {
  const token: string = value

  const resetPassword = await ResetPassword.findOne({ token: token })
  if (!resetPassword) {
    return Promise.reject('Reset token not found')
  }

  if (isExpired(resetPassword.expiration)) {
    return Promise.reject('Reset token has expired')
  }
  return Promise.resolve()
}

const isPasswordMatch: CustomValidator = async (value, { req }) => {
  if (value !== req.body.password) {
    return Promise.reject('Passwords must match')
  }
  return Promise.resolve()
}

const areDaysUpcoming: CustomValidator = async (value) => {
  const days: string[] = value
  for (let i = 0; i < days.length; i++) {
    if (!isUpcomingDay(new Date(days[i]))) {
      return Promise.reject('Days must be upcoming')
    }
  }
  return Promise.resolve()
}

const isDaysNotEmpty: CustomValidator = (_, { req }) => {
  return (req.body.days as []).length > 0
}

const isEndTimeUpcoming: CustomValidator = async (value, { req }) => {
  const rawEndTime: string = value
  const rawDays: string[] = req.body.days
  const endTime = new Date(rawEndTime)
  const days = rawDays.map((rawDay) => new Date(rawDay))
  const firstDay = days.sort((a, b) => a.getTime() - b.getTime())[0]
  firstDay.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0)
  if (!isUpcomingTime(firstDay)) {
    return Promise.reject('End time must be upcoming')
  }
  return Promise.resolve()
}

const isStartTimeBeforeEndTime: CustomValidator = async (value, { req }) => {
  const startTime: string = value
  const endTime: string = req.body.endTime
  if (new Date(endTime).getTime() < new Date(startTime).getTime()) {
    return Promise.reject('Start time must be before end time')
  }
  return Promise.resolve()
}

const isEndTimeAfterStartTime: CustomValidator = async (value, { req }) => {
  const endTime: string = value
  const startTime: string = req.body.startTime
  if (new Date(endTime).getTime() < new Date(startTime).getTime()) {
    return Promise.reject('End time must be after start time')
  }
  return Promise.resolve()
}

const isValidRoles: CustomValidator = async (value) => {
  const roles: string[] = value
  const roleKeys = Object.keys(Role)
  const uniqueRoles = [...new Set(roles)]
  if (roles.length != uniqueRoles.length) {
    return Promise.reject('Duplicate roles')
  }
  if (!roles.includes(Role.STANDARD)) {
    return Promise.reject('Roles must include STANDARD')
  }
  for (let i = 0; i < roles.length; i++) {
    if (!roleKeys.includes(roles[i])) {
      return Promise.reject('Invalid roles')
    }
  }
  return Promise.resolve()
}

const isValidTimeZone: CustomValidator = async (value) => {
  const timeZone: string = value
  if (TimeZones.includes(timeZone)) {
    return Promise.resolve()
  }
  return Promise.reject('Invalid time zone')
}

const isDeskAvailable: CustomValidator = async (_, { req }) => {
  const organizationId: string = req.params?.organizationId
  const deskId: string = req.params?.deskId
  const days: string[] = req.body.days
  const startTime = new Date(req.body.startTime as string)
  const endTime = new Date(req.body.endTime as string)

  const organization = await Organization.findById(organizationId)
  if (!organization) {
    return Promise.reject('Organization not found')
  }
  const reservations = await Reservation.find({
    organizationId: organizationId,
    'timeRanges.start': { $gte: lastMidnight() },
  })
  const desks = await Desk.find({ organizationId: organizationId })
  const deskConflictMap = generateDeskConflictMap(
    days.map((day) => new Date(day)),
    startTime,
    endTime,
    organization.cleaning,
    reservations,
    desks
  )

  if (deskConflictMap[deskId]) {
    return Promise.reject('Desk is not available')
  }
  return Promise.resolve()
}

const isCompleteAddress: CustomValidator = async (value, { req }) => {
  const city: string = req.body.city
  const state: string = req.body.state
  const zip: string = req.body.zip
  if ((city || state || zip) && !value) {
    return Promise.reject('Incomplete address')
  }
  return Promise.resolve()
}

const isStateAbbr: CustomValidator = async (value) => {
  if (StateCodes.includes(value)) {
    return Promise.resolve()
  }
  return Promise.reject('Invalid state')
}

const isUserEmail: CustomValidator = async (value, { req }) => {
  const user = req.user as UserType
  if (value === user.email) {
    return Promise.resolve()
  }
  return Promise.reject('Email is not correct')
}

const isLocalAuth: CustomValidator = (_, { req }) => {
  const user = req.user as UserType
  return user.authStrategy === AuthStrategy.LOCAL
}

const isValidPlan: CustomValidator = async (value) => {
  const planKeys = Object.keys(Plan)
  if (planKeys.includes(value) && value !== Plan.FREE) {
    return Promise.resolve()
  }
  return Promise.reject('Invalid plan')
}

export const inviteEmailsChecks = [
  check('emails')
    .isArray({ min: 1 })
    .withMessage('One or more emails required')
    .bail()
    .isArray({ max: 50 })
    .withMessage('Limited to 50 invites at a time')
    .custom(hasDuplicateMembers)
    .custom(hasDuplicateInvitations),
  check('emails.*').isEmail().withMessage('Email is not valid'),
]

export const paramCheck = (field: string) => {
  return [
    param(field)
      .not()
      .isEmpty()
      .withMessage(`Missing '${field}' parameter`)
      .not()
      .equals('undefined')
      .withMessage(`Missing '${field}' parameter`)
      .not()
      .equals('null')
      .withMessage(`Missing '${field}' parameter`)
      .bail()
      .isString(),
  ]
}

export const postRsvpChecks = [
  ...paramCheck('token'),
  param('token').custom(isValidInvitation),
]

export const postSignUpChecks = [
  check('email')
    .not()
    .isEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Email is not valid')
    .bail()
    .normalizeEmail()
    .custom(isEmailInUse),
  check('password')
    .not()
    .isEmpty()
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  check('captcha').not().isEmpty(),
]

const logInEmailCheck = check('email')
  .not()
  .isEmpty()
  .withMessage('Email is required')
  .bail()
  .isEmail()
  .withMessage('Email is not valid')
  .bail()
  .normalizeEmail()
  .custom(isEmailNotFoundLocal)
  .bail()
  .custom(isEmailGoogle)

export const postLogInChecks = [
  logInEmailCheck,
  check('password')
    .if(logInEmailCheck)
    .not()
    .isEmpty()
    .withMessage('Password is required')
    .bail()
    .custom(isPasswordCorrect),
  check('captcha').not().isEmpty(),
]

export const postConfirmEmailChecks = [
  ...paramCheck('token'),
  param('token').custom(isValidConfirmEmailToken),
]

export const postResetPasswordChecks = [
  check('email')
    .not()
    .isEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Email is not valid')
    .custom(isEmailGoogle)
    .normalizeEmail(),
]

export const postChangePasswordChecks = [
  ...paramCheck('token'),
  param('token').custom(isValidResetPasswordToken),
  check('password')
    .not()
    .isEmpty()
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  check('confirmPassword').custom(isPasswordMatch),
]

export const putChangePasswordChecks = [
  ...paramCheck('userId'),
  check('currentPassword')
    .not()
    .isEmpty()
    .withMessage('Current password is required')
    .bail()
    .custom(isCurrentPasswordCorrect),
  check('newPassword')
    .not()
    .isEmpty()
    .withMessage('New password is required')
    .bail()
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long'),
]

export const putNameChecks = [
  ...paramCheck('userId'),
  check('firstName').not().isEmpty().withMessage('First name is required'),
  check('lastName').not().isEmpty().withMessage('Last name is required'),
]

export const postDeleteAccountChecks = [
  ...paramCheck('userId'),
  check('email')
    .not()
    .isEmpty()
    .withMessage('Email is required')
    .bail()
    .custom(isUserEmail),
  check('phrase')
    .not()
    .isEmpty()
    .withMessage('Phrase is required')
    .matches('delete my account')
    .withMessage('Phrase is not correct'),
  check('password')
    .if(isLocalAuth)
    .not()
    .isEmpty()
    .withMessage('Password is required')
    .bail()
    .custom(isPasswordCorrect),
]

export const postOrganizationsChecks = [
  check('plan').not().isEmpty(),
  check('firstName').custom(isFirstNameRequired),
  check('lastName').custom(isLastNameRequired),
  check('name').not().isEmpty().withMessage('Organization name is required'),
  check('timeZone').not().isEmpty().custom(isValidTimeZone),
]

export const putOrganizationNameChecks = [
  ...paramCheck('organizationId'),
  check('name').not().isEmpty().withMessage('Organization name is required'),
]

export const putOrganizationCleaningChecks = [
  ...paramCheck('organizationId'),
  check('cleaning')
    .not()
    .isEmpty()
    .withMessage('Cleaning is required')
    .isBoolean(),
]

export const postInvitationsChecks = [
  ...paramCheck('organizationId'),
  ...inviteEmailsChecks,
]

export const putMembershipRolesChecks = [
  ...paramCheck('membershipId'),
  check('roles')
    .not()
    .isEmpty()
    .withMessage('Roles are required')
    .bail()
    .custom(isValidRoles),
]

export const postDesksChecks = [
  ...paramCheck('organizationId'),
  ...paramCheck('locationId'),
  ...paramCheck('spaceId'),
  check('name').not().isEmpty().withMessage('Desk name is required'),
]

export const postLocationsChecks = [
  ...paramCheck('organizationId'),
  check('name').not().isEmpty().withMessage('Location name is required'),
  check('street').optional().custom(isCompleteAddress),
  check('state').optional({ checkFalsy: true }).custom(isStateAbbr),
  check('zip')
    .optional({ checkFalsy: true })
    .isPostalCode('US')
    .withMessage('Invalid zip'),
  check('timeZone').not().isEmpty().custom(isValidTimeZone),
]

export const putLocationNameChecks = [
  ...paramCheck('locationId'),
  check('name').not().isEmpty().withMessage('Location name is required'),
]

export const putLocationAddressChecks = [
  ...paramCheck('locationId'),
  check('street').not().isEmpty().withMessage('Address is required'),
  check('state').optional({ checkFalsy: true }).custom(isStateAbbr),
  check('zip')
    .optional({ checkFalsy: true })
    .isPostalCode('US')
    .withMessage('Invalid zip'),
]

export const postSpaces = [
  ...paramCheck('organizationId'),
  ...paramCheck('locationId'),
  check('name').not().isEmpty().withMessage('Space name is required'),
]

export const putSpaceNameChecks = [
  ...paramCheck('spaceId'),
  check('name').not().isEmpty().withMessage('Space name is required'),
]

export const postReservationsChecks = [
  ...paramCheck('organizationId'),
  ...paramCheck('locationId'),
  ...paramCheck('spaceId'),
  ...paramCheck('deskId'),
  check('days')
    .not()
    .isEmpty()
    .withMessage('One or more days required')
    .bail()
    .custom(areDaysUpcoming),
  check('startTime')
    .not()
    .isEmpty()
    .withMessage('Start time is required')
    .bail()
    .custom(isStartTimeBeforeEndTime),
  check('endTime')
    .not()
    .isEmpty()
    .withMessage('End time is required')
    .bail()
    .custom(isEndTimeAfterStartTime)
    .bail()
    .if(isDaysNotEmpty)
    .custom(isEndTimeUpcoming),
  check('ids.deskId').custom(isDeskAvailable),
]

export const deleteReservationDayChecks = [
  ...paramCheck('reservationId'),
  ...paramCheck('timeRangeId'),
]

export const checkoutPlanChecks = [
  ...paramCheck('organizationId'),
  check('plan')
    .not()
    .isEmpty()
    .withMessage('Plan is required')
    .bail()
    .custom(isValidPlan),
  check('successUrl').not().isEmpty(),
  check('cancelUrl').not().isEmpty(),
]

export const changePlanChecks = [
  ...paramCheck('organizationId'),
  check('plan')
    .not()
    .isEmpty()
    .withMessage('Plan is required')
    .bail()
    .custom(isValidPlan),
]

export const postCustomerPortalChecks = [
  check('returnUrl').not().isEmpty().withMessage('Return URL is required'),
]
