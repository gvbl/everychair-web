export const joinConj = (
  array: any[],
  separator: string,
  conjunction: string
) => {
  if (array.length === 2) {
    return `${array[0]} and ${array[1]}`
  }
  return `${array.slice(0, -1).join(separator)}, ${conjunction} ${array.slice(
    -1
  )}`
}

export const toFormData = (data: any) => {
  const formData = new FormData()
  Object.keys(data).forEach((fieldName) => {
    if (data[fieldName] instanceof FileList) {
      const files: FileList = data[fieldName]
      for (let i = 0; i < files.length; i++) {
        const item = files.item(i)
        if (item) {
          formData.append(fieldName, item)
        }
      }
    } else if (
      Array.isArray(data[fieldName]) &&
      (data[fieldName] as Array<any>).every((value) => value instanceof Blob)
    ) {
      const blobs: Blob[] = data[fieldName]
      for (let i = 0; i < blobs.length; i++) {
        formData.append(fieldName, blobs[i])
      }
    } else {
      formData.append(fieldName, data[fieldName])
    }
  })
  return formData
}

export const isVisible = (element: HTMLElement) => {
  return (
    element.getBoundingClientRect().top >= 0 &&
    element.getBoundingClientRect().bottom <= window.innerHeight
  )
}

export const buildQuery = (params: Record<string, string>) => {
  return Object.keys(params)
    .filter((key) => params[key])
    .map((k) => `${k}=${params[k]}`)
    .join('&')
}

export const linkDomain = () => {
  if (process.env.REACT_APP_ENV === 'production') {
    return 'https://www.everychair.com'
  }
  if (process.env.REACT_APP_ENV === 'test') {
    return 'https://test.everychair.com'
  }
  if (process.env.REACT_APP_ENV === 'development') {
    return 'http://localhost:3000'
  }
  throw new Error(`Unknown environment: ${process.env.REACT_APP_ENV}`)
}

export const captchaSiteKey = () => {
  if (process.env.REACT_APP_ENV === 'production') {
    return '6Lex6GcaAAAAANlKWkPZt6L8Qq2ogqwE9RrkHg6B'
  }
  if (process.env.REACT_APP_ENV === 'test') {
    return '6LdSAEcaAAAAAIGHu5K4usaCQyP_ziIvoyjqTJBp'
  }
  if (process.env.REACT_APP_ENV === 'development') {
    return '6LfOJEcaAAAAAMlYm6aH2N7xUJGzV58nVuhWYDGs'
  }
  throw new Error(`Unknown environment: ${process.env.REACT_APP_ENV}`)
}
