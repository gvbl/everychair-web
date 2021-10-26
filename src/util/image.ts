export const unpackImage = (files: Express.Multer.File[]) => {
  const image = files ? files[0] : undefined
  const imageData: Buffer | undefined = image ? image.buffer : undefined
  const imageContentType: string | undefined = image
    ? image.mimetype
    : undefined
  return imageData && imageContentType
    ? { data: imageData, contentType: imageContentType }
    : undefined
}
