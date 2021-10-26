export const isImage = (file: File | Blob) => {
  if (!file.type) {
    return false
  }
  return file.type.startsWith('image')
}

export const toImageURL = (image?: FileList | Blob[]) => {
  if (!image) {
    return undefined
  }
  return image.length > 0 && isImage(image[0])
    ? URL.createObjectURL(image[0])
    : undefined
}
