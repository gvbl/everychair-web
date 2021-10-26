import { NextFunction, Request, Response } from 'express'
import { Logging } from '@google-cloud/logging'

export const postLogError = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const message: string = req.body.message

    const projectId = process.env.GCLOUD_PROJECT
    const logging = new Logging({ projectId })
    const log = logging.log('client')
    const metadata = {
      resource: { type: 'global' },
      severity: 'ERROR',
    }
    const entry = log.entry(metadata, message)
    await log.write(entry)

    res.status(204).send()
  } catch (err: any) {
    next(err)
  }
}
