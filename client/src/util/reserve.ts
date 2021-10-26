// sync with server src/util/reserve.ts

import Desk from '../models/api/Desk'
import Reservation, { TimeRange } from '../models/api/Reservation'

export const toTimeRanges = (days: Date[], startTime: Date, endTime: Date) => {
  return days.map((day) => {
    const start = new Date(day)
    const end = new Date(day)
    end.setDate(end.getDate() + (endTime.getDate() - startTime.getDate()))
    start.setHours(startTime.getHours(), startTime.getMinutes())
    end.setHours(endTime.getHours(), endTime.getMinutes())
    return {
      start: start,
      end: end,
    }
  })
}

export const generateDeskConflictMap = (
  days: Date[],
  startTime: Date,
  endTime: Date,
  cleaningMap: Record<string, boolean>,
  reservations: Reservation[],
  desks: Desk[]
) => {
  if (days.length === 0 || !startTime || !endTime) {
    return {} as Record<string, boolean>
  }

  const reserveTimeRanges = toTimeRanges(days, startTime, endTime)

  const deskTimeRangesMap = reservations.reduce((map, reservation) => {
    if (!map[reservation.deskId]) {
      map[reservation.deskId] = []
    }
    map[reservation.deskId].push(...reservation.timeRanges)
    return map
  }, {} as Record<string, TimeRange[]>)

  return desks.reduce((map, desk) => {
    const deskTimeRanges = deskTimeRangesMap[desk.id]
    if (!deskTimeRanges) {
      map[desk.id] = false
      return map
    }
    let conflict = false
    outterLoop: for (let i = 0; i < deskTimeRanges.length; i++) {
      const deskTimeRange = deskTimeRanges[i]
      for (let j = 0; j < reserveTimeRanges.length; j++) {
        const reserveTimeRange = reserveTimeRanges[j]
        const cleaningExtension = cleaningMap[desk.organizationId]
          ? 30 * 60 * 1000
          : 0
        if (
          !(
            reserveTimeRange.end.getTime() + cleaningExtension <=
              deskTimeRange.start.getTime() ||
            reserveTimeRange.start.getTime() >=
              deskTimeRange.end.getTime() + cleaningExtension
          )
        ) {
          conflict = true
          break outterLoop
        }
      }
    }
    map[desk.id] = conflict
    return map
  }, {} as Record<string, boolean>)
}
