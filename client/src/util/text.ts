// partial sync with server src/util/text.ts

import { Address } from '../models/api/Location'

export const formatNameOrAlternate = (
  alternate: string,
  firstName?: string,
  lastName?: string
) => {
  if (!firstName && !lastName) {
    return alternate
  }
  if (!lastName && firstName) {
    return firstName
  }
  return `${firstName} ${lastName}`.trim()
}

export const formatDayLong = (day: Date, boldDay: boolean = true) => {
  const options = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }
  return new Intl.DateTimeFormat('en-US', options)
    .formatToParts(day)
    .map(({ type, value }) => {
      switch (type) {
        case 'weekday':
          return boldDay ? `<b>${value}</b>` : value
        default:
          return value
      }
    })
    .join('')
}

export const formatDayShort = (day: Date, boldDay: boolean = true) => {
  const options = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }
  return new Intl.DateTimeFormat('en-US', options)
    .formatToParts(day)
    .map(({ type, value }) => {
      switch (type) {
        case 'weekday':
          return boldDay ? `<b>${value}</b>` : value
        default:
          return value
      }
    })
    .join('')
}

export const formatDaysMedium = (day: Date, boldDay: boolean = true) => {
  const options = {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }
  return new Intl.DateTimeFormat('en-US', options)
    .formatToParts(day)
    .map(({ type, value }) => {
      switch (type) {
        case 'weekday':
          return boldDay ? `<b>${value}</b>` : value
        default:
          return value
      }
    })
    .join('')
}

export const formatTimeRange = (
  timeRange: { start: Date; end: Date },
  showTimeZone?: boolean
) => {
  const sameDayPeriod =
    (timeRange.start.getHours() < 12 && timeRange.end.getHours() < 12) ||
    (timeRange.start.getHours() >= 12 && timeRange.end.getHours() >= 12)
  const formattedStartTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
  })
    .format(timeRange.start)
    .replace(' ', '')
    .replace('AM', sameDayPeriod ? '' : 'am')
    .replace('PM', sameDayPeriod ? '' : 'pm')
  const formattedEndTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: showTimeZone ? 'short' : undefined,
  })
    .format(timeRange.end)
    .replace(' ', '')
    .replace('AM', 'am')
    .replace('PM', 'pm')
  return `${formattedStartTime}-${formattedEndTime}`
}

export const formatAddressSecondary = (address?: Address) => {
  if (!address || (!address.city && !address.state && !address.zip)) {
    return undefined
  }
  return `${address.city ? address.city : ''}${
    address.city && (!!address.state || !!address.zip) ? ',' : ''
  }${address.state ? ' ' + address.state : ''}${
    address.zip ? ' ' + address.zip : ''
  }`
}
