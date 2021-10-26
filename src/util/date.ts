// partial sync with client side src/util/date.ts

export const now = () => {
  return new Date()
}

export const lastMidnight = () => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

export const isUpcomingDay = (day: Date) => {
  return lastMidnight().getTime() <= day.getTime()
}

export const isUpcomingTime = (day: Date) => {
  return day.getTime() > new Date().getTime()
}

// partial sync with cleaning scheduler src/clock.ts

const roundUpHalfHour = (date: Date) => {
  const nextHalfHour = new Date(date)
  if (date.getMinutes() <= 30) {
    nextHalfHour.setMinutes(30, 0, 0)
  } else {
    nextHalfHour.setTime(date.getTime() + 60 * 60 * 1000)
    nextHalfHour.setMinutes(0, 0, 0)
  }
  return nextHalfHour
}

export const missedCleaningNotice = (date: Date) => {
  const nextHalfHour = roundUpHalfHour(new Date())
  const diff = nextHalfHour.getTime() - date.getTime()
  return diff < 15 * 60 * 1000
}
