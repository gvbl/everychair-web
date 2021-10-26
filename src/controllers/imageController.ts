import { NextFunction, Request, Response } from 'express'
import multer from 'multer'
import { oneParamError } from '../errors'

const imageUpload = multer({
  limits: { fileSize: 3000000 },
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith('image')) {
      return cb(new Error('This file is not an image'))
    }
    cb(null, true)
  },
})

export const imageUploadMiddleware = (field: string) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  imageUpload.array(field, 1)(req, res, (multErr: any) => {
    if (multErr) {
      const error: Error = multErr
      const message =
        error.message === 'File too large'
          ? 'Image size cannot be larger than 3MB'
          : error.message
      res.status(400).send(oneParamError(message, field))
      return
    }
    next()
  })
}
