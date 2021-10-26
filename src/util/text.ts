// partial sync with client src/util/text.ts

import { ITimeRange } from '../models/Reservation'

export const formatStart = (startTime: Date, timeZone: string) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZone: timeZone,
    timeZoneName: 'short',
  }).format(startTime)
}

export const formatName = (firstName?: string, lastName?: string) => {
  if (!firstName && !lastName) {
    return ''
  }
  if (!lastName) {
    return firstName
  }
  return `${firstName} ${lastName}`.trim()
}

export const formatDay = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export const formatTimeRange = (
  timeRange: { start: Date; end: Date },
  timeZone: string,
  showTimeZone?: boolean
) => {
  const sameDayPeriod =
    (timeRange.start.getHours() < 12 && timeRange.end.getHours() < 12) ||
    (timeRange.start.getHours() >= 12 && timeRange.end.getHours() >= 12)
  const formattedStartTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    timeZone: timeZone,
  })
    .format(timeRange.start)
    .replace(' ', '')
    .replace('AM', sameDayPeriod ? '' : 'am')
    .replace('PM', sameDayPeriod ? '' : 'pm')
  const formattedEndTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    timeZone: timeZone,
    timeZoneName: showTimeZone ? 'short' : undefined,
  })
    .format(timeRange.end)
    .replace(' ', '')
    .replace('AM', 'am')
    .replace('PM', 'pm')
  return `${formattedStartTime}-${formattedEndTime}`
}

export const formatReservationDay = (
  timeRange: ITimeRange,
  timeZone: string
) => {
  const day = formatDay(timeRange.start)
  const times = formatTimeRange(timeRange, timeZone, true)
  return `${day}, ${times}`
}

// partial sync with cleaning scheduler src/clock.ts

export const formatTime = (date: Date, timeZone: string) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    timeZone: timeZone,
    timeZoneName: 'short',
  }).format(date)
}
