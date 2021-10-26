// partial sync with server side src/util/date.ts

import { TimeRange } from '../models/api/Reservation'

export const now = () => {
  return new Date()
}

export const today = () => {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  return date
}

export const lastMidnight = () => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

export const midnight = () => {
  const date = new Date()
  date.setHours(24, 0, 0, 0)
  return date
}

export const isBeforeBOD = () => {
  return new Date().getHours() < 9
}

export const isBeforeEOD = () => {
  return new Date().getHours() < 17
}

export const beginningOfDay = () => {
  const date = new Date()
  date.setHours(9, 0, 0, 0)
  return date
}

export const endOfDay = () => {
  const date = new Date()
  date.setHours(17, 0, 0, 0)
  return date
}

export const dayBefore = (date: Date) => {
  const before = new Date(date)
  before.setDate(date.getDate() - 1)
  return before
}

export const dayAfter = (date: Date) => {
  const after = new Date(date)
  after.setDate(date.getDate() + 1)
  return after
}

export const tomorrow = () => {
  return dayAfter(today())
}

export const pastHalfHours = (date: Date) => {
  const past: Date[] = []
  let halfHour = lastMidnight()
  while (halfHour.getTime() < date.getTime()) {
    past.push(new Date(halfHour))
    halfHour.setTime(halfHour.getTime() + 30 * 60 * 1000)
  }
  return past
}

export const lastHalfHour = (date: Date) => {
  const rounded = new Date(date)
  if (date.getMinutes() < 30) {
    rounded.setMinutes(0, 0, 0)
  } else {
    rounded.setMinutes(30, 0, 0)
  }
  return rounded
}

export const plusThirtyMinutes = (date: Date) => {
  return new Date(date.getTime() + 30 * 60 * 1000)
}

export const isSameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate()

export const isDone = (end: Date) => {
  return end.getTime() < new Date().getTime()
}

export const isInProgress = (timeRange: TimeRange) => {
  const date = new Date()
  return (
    date.getTime() >= timeRange.start.getTime() &&
    date.getTime() <= timeRange.end.getTime()
  )
}

export const isToday = (date: Date) => {
  return isSameDay(date, new Date())
}

export const isTodayUpcoming = (date: Date) => {
  return isSameDay(date, new Date()) && date.getTime() > new Date().getTime()
}

export const isTomorrow = (date: Date) => {
  return isSameDay(date, tomorrow())
}

export const isUpcomingDay = (date: Date) => {
  return date.getTime() >= lastMidnight().getTime()
}

export const isUpcomingTime = (date: Date) => {
  return date.getTime() > new Date().getTime()
}
