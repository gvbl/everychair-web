import { Request } from 'express'
import passport from 'passport'
import { Profile, Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { sendWelcome } from './controllers/email'
import { USER_NOT_FOUND_ERROR } from './errors'
import { AuthStrategy, User, UserType } from './models/User'
import * as keys from './services/config/keys'

passport.serializeUser<UserType, string>(
  (user: UserType, done: (err: any, id: string) => void) => {
    done(undefined, user.id)
  }
)

passport.deserializeUser<UserType, string>(
  (id: string, done: (err: any, user?: UserType) => void) => {
    User.findById(id, (err: any, user: UserType) => {
      if (err) {
        done(USER_NOT_FOUND_ERROR, undefined)
        return
      }
      done(undefined, user)
    })
  }
)

const firstEmail = (
  emails?: Array<{
    value: string
    type?: string
  }>
): string | undefined => {
  if (!emails || emails.length == 0) {
    return undefined
  }
  if (emails.length > 1) {
    console.warn('more than one email associated with Google account')
  }
  return emails[0].value
}

export type GoogleVerifyCallback = (err?: any, user?: any, info?: any) => void

passport.use(
  'google-sign-up',
  new GoogleStrategy(
    {
      clientID: keys.GOOGLE_CLIENT_ID,
      clientSecret: keys.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/signup/google/callback',
      proxy: true,
    },
    async (_1, _2, profile: Profile, done: GoogleVerifyCallback) => {
      try {
        const existingGoogleUser = await User.findOne({ googleId: profile.id })
        if (existingGoogleUser) {
          done({
            name: 'googleAccountExistsError',
            message:
              'an account is already associated with this Google account',
          })
          return
        }
        const email = firstEmail(profile.emails)
        if (!email) {
          done({
            name: 'googleNoEmailError',
            message: 'no email associated with this Google account',
          })
          return
        }
        const localUser = await User.findOne({
          email: email,
          authStrategy: AuthStrategy.LOCAL,
        })
        if (localUser) {
          done({
            name: 'googleLinkError',
            message:
              'this email associated with an account that is not linked to Google',
          })
          return
        }
        const newUser = await new User({
          authStrategy: AuthStrategy.GOOGLE,
          email: email,
          emailConfirmed: true,
          googleId: profile.id,
          selected: {},
        }).save()
        await sendWelcome(newUser.email)
        done(undefined, newUser)
      } catch (err: any) {
        done(err)
      }
    }
  )
)

passport.use(
  'google-log-in',
  new GoogleStrategy(
    {
      clientID: keys.GOOGLE_CLIENT_ID,
      clientSecret: keys.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/login/google/callback',
      proxy: true,
    },
    async (_1, _2, profile: Profile, done: GoogleVerifyCallback) => {
      try {
        const existingGoogleUser = await User.findOne({ googleId: profile.id })
        if (existingGoogleUser) {
          done(undefined, existingGoogleUser)
          return
        }
        const email = firstEmail(profile.emails)
        const localUser = await User.findOne({
          email: email,
          authStrategy: AuthStrategy.LOCAL,
        })
        if (localUser) {
          done({
            name: 'googleLinkError',
            message:
              'this email associated with an account that is not linked to Google',
          })
          return
        }
        done({
          name: 'googleNoAccountError',
          message: 'no account associated with this Google account',
        })
      } catch (err: any) {
        done(err)
      }
    }
  )
)

passport.use(
  'google-delete-account',
  new GoogleStrategy(
    {
      clientID: keys.GOOGLE_CLIENT_ID,
      clientSecret: keys.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/delete-account/google/callback',
      passReqToCallback: true,
      proxy: true,
    },
    async (
      req: Request,
      _1,
      _2,
      profile: Profile,
      done: GoogleVerifyCallback
    ) => {
      try {
        if (!req.session) {
          done({
            name: 'emptySession',
            message: 'empty request session',
          })
          return
        }
        const userId: string = req.session.userId
        const email: string = req.session.email
        const phrase: string = req.session.phrase

        const user = await User.findById(userId)
        if (user?.googleId !== profile.id) {
          done({
            name: 'wrongAccount',
            message: 'your identity could not be verified with Google',
          })
          return
        }
        if (!email) {
          done({
            name: 'emailRequired',
            message: 'email was missing',
          })
          return
        }
        if (email !== user?.email) {
          done({
            name: 'emailIncorrect',
            message: 'email was not correct',
          })
          return
        }
        if (!phrase) {
          done({
            name: 'phraseRequired',
            message: 'phrase was missing',
          })
          return
        }
        if (phrase !== 'delete my account') {
          done({
            name: 'phraseIncorrect',
            message: 'phrase was not correct',
          })
          return
        }
        done(undefined, user)
      } catch (err: any) {
        done(err, undefined)
      }
    }
  )
)
