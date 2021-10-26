import { Request } from 'express'

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

export const linkDomain = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://www.everychair.com'
  }
  if (process.env.NODE_ENV === 'test') {
    return 'https://test.everychair.com'
  }
  return 'http://localhost:3000'
}

export const parseQueryCSV = (query: string) => {
  return query ? query.split(',') : []
}

export const extractIp = (req: Request) => {
  const rawAddress =
    ((req.headers['x-forwarded-for'] as string) ||
      req.connection.remoteAddress) ??
    ''
  return rawAddress.replace(/^.*:/, '')
}
