import bodyParser from 'body-parser'
import cookieSession from 'cookie-session'
import { NextFunction, Request, Response } from 'express'
import * as keys from '../services/config/keys'

const TEST_ACCESS_TOKEN = 'oqxBjRckeP'

export const getTestAccess = (req: Request, res: Response) => {
  const token: string = req.params.token

  if (token !== TEST_ACCESS_TOKEN) {
    res.status(401).send('Access denied')
    return
  }

  res
    .cookie('testAccessToken', TEST_ACCESS_TOKEN, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
    })
    .send('Access granted')
}

export const testAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.testAccessToken

  if (req.originalUrl === '/api/stripe/webhook') {
    next()
    return
  }

  if (token === TEST_ACCESS_TOKEN) {
    next()
    return
  }

  res.status(401).send('Test access token required')
}

export const stripeWebhookSkipParser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.originalUrl === '/api/stripe/webhook') {
    next()
  } else {
    bodyParser.json()(req, res, next)
  }
}

export const cookieSessionHandler = cookieSession({
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  keys: [keys.MONGO_URI],
})

export const sessionRefresh = (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  if (!req.session) {
    next()
    return
  }
  req.session.nowInMinutes = Math.floor(Date.now() / (60 * 1000))
  next()
}

type Environment = 'production' | 'development' | 'test'

export const sslRedirect = (
  environments: Environment[] = ['production'],
  status: 301 | 302 = 302
) => {
  const currentEnv = process.env.NODE_ENV as Environment

  const isCurrentEnv = environments.includes(currentEnv)

  return (req: Request, res: Response, next: NextFunction) => {
    if (isCurrentEnv) {
      req.headers['x-forwarded-proto'] !== 'https'
        ? res.redirect(status, 'https://' + req.hostname + req.originalUrl)
        : next()
    } else next()
  }
}
