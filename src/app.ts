import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express, { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import morgan from 'morgan'
import morganBody from 'morgan-body'
import passport from 'passport'
import path from 'path'
import {
  authorizeAdminDesk,
  authorizeAdminInvitation,
  authorizeAdminLocation,
  authorizeAdminOrganization,
  authorizeAdminOrganizations,
  authorizeAdminSpace,
  authorizeAuthLocal,
  authorizeCreatorReservation,
  authorizeDeleteMembership,
  authorizeDesksQuota,
  authorizeEmailConfirmed,
  authorizeFreeQuota,
  authorizeLocationsQuota,
  authorizeLogInCaptcha,
  authorizeMemberDesk,
  authorizeMemberLocation,
  authorizeMemberOrganization,
  authorizeMemberOrganizations,
  authorizeMembersQuota,
  authorizeMutualMembership,
  authorizeOwnerOrganization,
  authorizePaid,
  authorizeQuotas,
  authorizeSelf,
  authorizeSignUpCaptcha,
  authorizeSpacesQuota,
  authorizeUpdateMembershipRoles,
  isAuthenticated,
  isNotAuthenticated,
} from './authorization'
import {
  cookieSessionHandler,
  getTestAccess,
  sessionRefresh,
  sslRedirect,
  stripeWebhookSkipParser,
  testAuth,
} from './controllers/applicationController'
import * as billingController from './controllers/billingController'
import * as logController from './controllers/logController'
import { getFake } from './controllers/fakeController'
import { imageUploadMiddleware } from './controllers/imageController'
import * as controller from './controllers/mainController'
import './models/User'
import './passport'
import * as keys from './services/config/keys'
import {
  changePlanChecks,
  checkoutPlanChecks,
  deleteReservationDayChecks,
  paramCheck,
  postChangePasswordChecks,
  postConfirmEmailChecks,
  postCustomerPortalChecks,
  postDeleteAccountChecks,
  postDesksChecks,
  postInvitationsChecks,
  postLocationsChecks,
  postLogInChecks,
  postOrganizationsChecks,
  postReservationsChecks,
  postResetPasswordChecks,
  postRsvpChecks,
  postSignUpChecks,
  postSpaces,
  putChangePasswordChecks,
  putLocationAddressChecks,
  putLocationNameChecks,
  putMembershipRolesChecks,
  putNameChecks,
  putOrganizationCleaningChecks,
  putOrganizationNameChecks,
  putSpaceNameChecks,
  validate,
} from './validation'

mongoose
  .connect(keys.MONGO_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // trigger initial creation of collections
    mongoose.connection.db
      .listCollections()
      .toArray()
      .then((collections) => {
        console.info(`Mongo DB has ${collections.length} collections.`)
      })
  })

const app = express()

app.use(sslRedirect(['production', 'test']))
app.use(cookieSessionHandler)
app.use(sessionRefresh)
app.use(cookieParser())
if (process.env.NODE_ENV === 'test') {
  morganBody(app)
  app.use(morgan('common'))
  app.get('/test-access/:token', getTestAccess)
  app.use(testAuth)
}
if (process.env.NODE_ENV === 'development') {
  morganBody(app)
  app.use(morgan('dev'))
}
app.use(passport.initialize())
app.use(passport.session())
app.use(stripeWebhookSkipParser)

const googlAuthMiddleware = (req: Request, _: Response, next: NextFunction) => {
  if (req.session) {
    req.session.origin = req.query.origin
    req.session.redirect = req.query.redirect
  }
  next()
}

const deleteAccountMiddleware = (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  if (req.session) {
    req.session.userId = req.query.userId
    req.session.email = req.query.email
    req.session.phrase = req.query.phrase
  }
  next()
}

const passportGoogleSignUp = passport.authenticate('google-sign-up', {
  scope: ['profile', 'email'],
})
const passportGoogleLogIn = passport.authenticate('google-log-in', {
  scope: ['profile', 'email'],
})
const passportGoogleDeleteAccount = passport.authenticate(
  'google-delete-account',
  {
    scope: ['profile', 'email'],
  }
)

if (process.env.NODE_ENV === 'development') {
  app.get('/api/fake', getFake)
}

app.get(
  '/api/signup/google',
  isNotAuthenticated,
  googlAuthMiddleware,
  passportGoogleSignUp
)
app.get('/api/signup/google/callback', controller.getGoogleSignUpCallback)
app.get(
  '/api/login/google',
  isNotAuthenticated,
  googlAuthMiddleware,
  passportGoogleLogIn
)
app.get('/api/login/google/callback', controller.getGoogleLogInCallback)
app.get(
  '/api/delete-account/google',
  deleteAccountMiddleware,
  passportGoogleDeleteAccount
)
app.get(
  '/api/delete-account/google/callback',
  controller.getGoogleDeleteAccountCallback
)
app.post(
  '/api/signup/local',
  validate(postSignUpChecks),
  isNotAuthenticated,
  authorizeSignUpCaptcha,
  controller.postSignUp
)
app.post(
  '/api/login/local',
  validate(postLogInChecks),
  isNotAuthenticated,
  authorizeLogInCaptcha,
  controller.postLogIn
)
app.get('/api/logout', (req, res) => {
  req.logOut()
  res.redirect('/')
})
app.post(
  '/api/reset-password',
  validate(postResetPasswordChecks),
  controller.postResetPassword
)
app.post(
  '/api/change-password/:token',
  validate(postChangePasswordChecks),
  controller.postChangePassword
)

// users
app.get('/api/users/current', controller.getUser)
app.post(
  '/api/users/:userId/send-email-confirmation',
  isAuthenticated,
  authorizeSelf,
  controller.postSendEmailConfirmation
)
app.post(
  '/api/users/:userId/confirm-email/:token',
  isAuthenticated,
  authorizeSelf,
  validate(postConfirmEmailChecks),
  controller.postConfirmEmail
)
app.put(
  '/api/users/:userId/password',
  isAuthenticated,
  validate(putChangePasswordChecks),
  authorizeSelf,
  controller.putUser
)
app.put(
  '/api/users/:userId/name',
  isAuthenticated,
  validate(putNameChecks),
  authorizeSelf,
  controller.putUser
)
app.put(
  '/api/users/:userId/avatar',
  isAuthenticated,
  imageUploadMiddleware('avatar'),
  validate(paramCheck('userId')),
  authorizeSelf,
  controller.putUser
)
app.delete(
  '/api/users/:userId/avatar',
  isAuthenticated,
  validate(paramCheck('userId')),
  authorizeSelf,
  controller.removeAvatar
)
app.get(
  '/api/users/:userId/avatar/:imageId',
  isAuthenticated,
  validate(paramCheck('userId')),
  authorizeMutualMembership,
  controller.getUserAvatar
)
app.post(
  '/api/users/:userId/delete-account',
  isAuthenticated,
  validate(postDeleteAccountChecks),
  authorizeSelf,
  authorizeAuthLocal,
  controller.postDeleteAccount
)

// organizations
app.post(
  '/api/organizations',
  isAuthenticated,
  imageUploadMiddleware('icon'),
  validate(postOrganizationsChecks),
  authorizeFreeQuota,
  controller.postOrganizations
)
app.put(
  '/api/organizations/:organizationId/name',
  isAuthenticated,
  validate(putOrganizationNameChecks),
  authorizeOwnerOrganization,
  controller.putOrganization
)
app.put(
  '/api/organizations/:organizationId/icon',
  isAuthenticated,
  imageUploadMiddleware('icon'),
  validate(paramCheck('organizationId')),
  authorizeOwnerOrganization,
  controller.putOrganization
)
app.delete(
  '/api/organizations/:organizationId/icon',
  isAuthenticated,
  authorizeOwnerOrganization,
  controller.deleteOrganizationIcon
)
app.put(
  '/api/organizations/:organizationId/cleaning',
  isAuthenticated,
  validate(putOrganizationCleaningChecks),
  authorizeOwnerOrganization,
  controller.putOrganization
)
app.get(
  '/api/organizations/:organizationId/icon/:imageId',
  isAuthenticated,
  validate(paramCheck('organizationId')),
  authorizeMemberOrganization,
  controller.getOrganizationIcon
)
app.delete(
  '/api/organizations/:organizationId',
  isAuthenticated,
  validate(paramCheck('organizationId')),
  authorizeOwnerOrganization,
  controller.deleteOrganization
)

// memberships
app.get('/api/memberships', isAuthenticated, controller.getMemberships)
app.delete(
  '/api/memberships/:membershipId',
  isAuthenticated,
  validate(paramCheck('membershipId')),
  authorizeDeleteMembership,
  controller.deleteMembership
)
app.put(
  '/api/memberships/:membershipId/roles',
  isAuthenticated,
  validate(putMembershipRolesChecks),
  authorizeUpdateMembershipRoles,
  controller.putMembership
)

// invitations
app.get(
  '/api/invitations',
  isAuthenticated,
  authorizeAdminOrganizations,
  controller.getInvitations
)
app.post(
  '/api/organizations/:organizationId/invitations',
  isAuthenticated,
  validate(postInvitationsChecks),
  authorizeEmailConfirmed,
  authorizeAdminOrganization,
  authorizeMembersQuota,
  authorizePaid,
  controller.postInvitations
)
app.post(
  '/api/rsvp/:token',
  isAuthenticated,
  validate(postRsvpChecks),
  controller.postRsvp
)
app.delete(
  '/api/invitations/:invitationId',
  isAuthenticated,
  validate(paramCheck('invitationId')),
  authorizeAdminInvitation,
  controller.deleteInvitation
)

// members
app.get(
  '/api/members',
  isAuthenticated,
  authorizeMemberOrganizations,
  controller.getMembers
)

// locations
app.get(
  '/api/locations',
  isAuthenticated,
  authorizeMemberOrganizations,
  controller.getLocations
)
app.post(
  '/api/organizations/:organizationId/locations',
  isAuthenticated,
  imageUploadMiddleware('image'),
  validate(postLocationsChecks),
  authorizeAdminOrganization,
  authorizeLocationsQuota,
  authorizePaid,
  controller.postLocations
)
app.put(
  '/api/locations/:locationId/name',
  isAuthenticated,
  validate(putLocationNameChecks),
  authorizeAdminLocation,
  controller.putLocation
)
app.put(
  '/api/locations/:locationId/image',
  isAuthenticated,
  imageUploadMiddleware('image'),
  validate(paramCheck('locationId')),
  authorizeAdminLocation,
  controller.putLocation
)
app.delete(
  '/api/locations/:locationId/image',
  isAuthenticated,
  authorizeAdminLocation,
  controller.deleteLocationImage
)
app.put(
  '/api/locations/:locationId/address',
  isAuthenticated,
  validate(putLocationAddressChecks),
  authorizeAdminLocation,
  controller.putLocation
)
app.delete(
  '/api/locations/:locationId/address',
  isAuthenticated,
  authorizeAdminLocation,
  controller.deleteLocationAddress
)
app.delete(
  '/api/locations/:locationId',
  isAuthenticated,
  validate(paramCheck('locationId')),
  authorizeAdminLocation,
  controller.deleteLocation
)
app.get(
  '/api/locations/:locationId/image/:imageId',
  isAuthenticated,
  validate(paramCheck('locationId')),
  authorizeMemberLocation,
  controller.getLocationImage
)

// spaces
app.get(
  '/api/spaces',
  isAuthenticated,
  authorizeMemberOrganizations,
  controller.getSpaces
)
app.post(
  '/api/organizations/:organizationId/locations/:locationId/spaces',
  isAuthenticated,
  validate(postSpaces),
  authorizeAdminOrganization,
  authorizeSpacesQuota,
  authorizePaid,
  controller.postSpaces
)
app.put(
  '/api/spaces/:spaceId/name',
  isAuthenticated,
  validate(putSpaceNameChecks),
  authorizeAdminSpace,
  controller.putSpace
)
app.delete(
  '/api/spaces/:spaceId',
  isAuthenticated,
  validate(paramCheck('spaceId')),
  authorizeAdminSpace,
  controller.deleteSpace
)

// desks
app.get(
  '/api/desks',
  isAuthenticated,
  authorizeMemberOrganizations,
  controller.getDesks
)
app.post(
  '/api/organizations/:organizationId/locations/:locationId/spaces/:spaceId/desks',
  isAuthenticated,
  imageUploadMiddleware('image'),
  validate(postDesksChecks),
  authorizeAdminOrganization,
  authorizeDesksQuota,
  authorizePaid,
  controller.postDesks
)
app.delete(
  '/api/desks/:deskId',
  isAuthenticated,
  validate(paramCheck('deskId')),
  authorizeAdminDesk,
  controller.deleteDesk
)
app.get(
  '/api/desks/:deskId/image/:imageId',
  isAuthenticated,
  validate(paramCheck('deskId')),
  authorizeMemberDesk,
  controller.getDeskImage
)

// reservations
app.get(
  '/api/reservations',
  isAuthenticated,
  authorizeMemberOrganizations,
  controller.getReservations
)
app.post(
  '/api/organizations/:organizationId/locations/:locationId/spaces/:spaceId/desks/:deskId/reservations',
  isAuthenticated,
  validate(postReservationsChecks),
  authorizeMemberOrganization,
  authorizePaid,
  controller.postReservations
)
app.delete(
  '/api/reservations/:reservationId/days/:timeRangeId',
  isAuthenticated,
  validate(deleteReservationDayChecks),
  authorizeCreatorReservation,
  controller.deleteReservationDay
)
app.delete(
  '/api/reservations/:reservationId',
  isAuthenticated,
  validate(paramCheck('reservationId')),
  authorizeCreatorReservation,
  controller.deleteReservation
)

// billing

app.post(
  '/api/organizations/:organizationId/checkout-plan',
  isAuthenticated,
  validate(checkoutPlanChecks),
  authorizeOwnerOrganization,
  billingController.postCheckoutPlan
)
app.post(
  '/api/organizations/:organizationId/refresh-plan-subscription',
  isAuthenticated,
  paramCheck('organizationId'),
  authorizeOwnerOrganization,
  billingController.postRefreshPlanSubscription
)

app.put(
  '/api/organizations/:organizationId/change-plan',
  isAuthenticated,
  validate(changePlanChecks),
  authorizeOwnerOrganization,
  authorizePaid,
  authorizeQuotas,
  billingController.putChangePlan
)

app.put(
  '/api/organizations/:organizationId/cancel-plan',
  isAuthenticated,
  paramCheck('organizationId'),
  authorizeOwnerOrganization,
  authorizePaid,
  authorizeQuotas,
  billingController.putCancelPlan
)

app.post(
  '/api/customer-portal-url',
  isAuthenticated,
  validate(postCustomerPortalChecks),
  billingController.postCustomerPortal
)

app.post(
  '/api/stripe/webhook',
  bodyParser.raw({ type: 'application/json' }),
  billingController.postStripeWebhook
)

app.post('/api/log/error', logController.postLogError)

app.use(controller.handleErrors)

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
  app.use(express.static('client/build'))
  app.get('*', (_, res: Response) => {
    res.sendFile(path.resolve(__dirname, '..', 'client', 'build', 'index.html'))
  })
}

const port = process.env.PORT || 5000
app.listen(port)
