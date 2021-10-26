import Mailgun from 'mailgun-js'
import { DeskType } from '../models/Desk'
import { IInvitation } from '../models/Invitation'
import { LocationType } from '../models/Location'
import { ITimeRange, ReservationType } from '../models/Reservation'
import { UserType } from '../models/User'
import * as keys from '../services/config/keys'
import {
  formatDay,
  formatName,
  formatReservationDay,
  formatStart,
  formatTime,
  formatTimeRange,
} from '../util/text'
import { linkDomain } from '../util/util'

const isProduction = process.env.NODE_ENV === 'production'

const MAIL_DOMAIN = isProduction
  ? 'mail.everychair.com'
  : 'sandbox423d378887a74fffa35cf265d42bde5f.mailgun.org'

const MAIL_FROM = isProduction
  ? 'Everychair <noreply@mail.everychair.com>'
  : 'Everychair Sandbox <noreply@sandbox423d378887a74fffa35cf265d42bde5f.mailgun.org>'

export const sendWelcome = async (email: string, token?: string) => {
  const mg = new Mailgun({
    apiKey: keys.MAILGUN_API_KEY,
    domain: MAIL_DOMAIN,
  })
  const emailConfirmationFooter = token
    ? `<p><a href="${linkDomain()}/email-confirmation/${token}" target="_blank">Click here</a> to confirm your email.</p>`
    : ''
  const data = {
    from: MAIL_FROM,
    to: email,
    subject: `Welcome to Everychair`,
    html: `<p>You've successfully created your Everychair account!</p>${emailConfirmationFooter}`,
  }

  return mg.messages().send(data)
}

export const sendEmailConfirmation = async (email: string, token: string) => {
  const mg = new Mailgun({
    apiKey: keys.MAILGUN_API_KEY,
    domain: MAIL_DOMAIN,
  })
  const data = {
    from: MAIL_FROM,
    to: email,
    subject: `Email confirmation for Everychair`,
    html: `<p>You've requested to confirm this email which is associated with your Everychair account.</p><p><a href="${linkDomain()}/email-confirmation/${token}" target="_blank">Click here</a> to confirm.</p>`,
  }

  return mg.messages().send(data)
}

export interface RecipientData {
  token: string
}

export const invitationVariables = (invitations: IInvitation[]) => {
  return invitations.reduce((map, invitation) => {
    map[invitation.email] = { token: invitation.token }
    return map
  }, {} as Record<string, RecipientData>)
}

export const sendInvitations = async (
  emails: string[],
  organizationName: string,
  variables: Record<string, RecipientData>
) => {
  const mg = new Mailgun({
    apiKey: keys.MAILGUN_API_KEY,
    domain: MAIL_DOMAIN,
  })
  const data = {
    from: MAIL_FROM,
    to: emails.join(', '),
    subject: `Invitation to join ${organizationName}`,
    html: `<p>You're invited to join ${organizationName} to reserve desks with Everychair.</p><p><a href="${linkDomain()}/rsvp/%recipient.token%" target="blank">Click here to accept!</a></p><br/><p>Your invitation will expire in 7 days.</p>`,
    'recipient-variables': variables,
  }

  return mg.messages().send(data)
}

export const sendReservationConfirmation = (
  email: string,
  reservation: ReservationType,
  location: LocationType,
  desk: DeskType
) => {
  const renderedDaysAndTimes = reservation.timeRanges.map(
    (timeRange) =>
      `${formatReservationDay(
        timeRange,
        location.timeZone
      )} <a href="${linkDomain()}/reservations/${reservation.id}/days/${
        timeRange.id
      }" target="blank">Details</a>`
  )

  const multiDay = reservation.timeRanges.length > 1

  const mg = new Mailgun({
    apiKey: keys.MAILGUN_API_KEY,
    domain: MAIL_DOMAIN,
  })
  const data = {
    from: MAIL_FROM,
    to: email,
    subject: `Reservation confirmed for desk: ${
      desk.name
    } - Starting ${formatStart(
      reservation.timeRanges[0].start,
      location.timeZone
    )}`,
    html: `<p>Your reservation is confirmed for the following day${
      multiDay ? 's' : ''
    } and time${multiDay ? 's' : ''}.</p><br/>${renderedDaysAndTimes.join(
      '<br/><br/>'
    )}`,
  }

  return mg.messages().send(data)
}

const conflictTableEntry = (
  rowHeader: string,
  linkLeft: string,
  linkTextLeft: string,
  linkRight: string,
  linkTextRight: string
) => {
  return `<tr><td>${rowHeader}</td><td><a href="${linkLeft}" target="_blank">${linkTextLeft}</a></td><td><a href="${linkRight}" target="_blank">${linkTextRight}</td></tr>`
}

export const sendCleaningConflict = (
  userA: UserType,
  location: LocationType,
  reservationA: ReservationType,
  userB: UserType,
  reservationB: ReservationType,
  adminCleaningCrewEmails: string[]
) => {
  let tableTop = `<tr><td>Member</td><td>${formatName(
    userA.firstName,
    userA.lastName
  )}</td><td>${formatName(
    userB.firstName,
    userB.lastName
  )}</td></tr><tr><td></td><td>${userA.email}</td><td>${userB.email}</td></tr>`
  let tableBottomA = ''
  let tableBottomB = ''
  let tableBottomBoth = ''
  let tableBottomOther = ''

  reservationA.timeRanges.forEach((timeRange) => {
    const conflictTimeRange = reservationB.timeRanges.find(
      (compareTimeRange) =>
        compareTimeRange.start.getTime() === timeRange.end.getTime()
    )
    if (conflictTimeRange) {
      const rowHeader = formatDay(timeRange.start)
      const linkReservationDayA = `${linkDomain()}/reservations/${
        reservationA.id
      }/days/${timeRange.id}`
      const linkReservationDayB = `${linkDomain()}/reservations/${
        reservationB.id
      }/days/${conflictTimeRange.id}`
      const linkTextA = formatTimeRange(timeRange, location.timeZone)
      const linkTextB = formatTimeRange(conflictTimeRange, location.timeZone)
      const linkCleaningA = `${linkDomain()}/cleaning/${reservationA.id}/days/${
        timeRange.id
      }`
      const linkCleaningB = `${linkDomain()}/cleaning/${reservationB.id}/days/${
        conflictTimeRange.id
      }`
      tableBottomA += conflictTableEntry(
        rowHeader,
        linkReservationDayA,
        linkTextA,
        '',
        linkTextB
      )
      tableBottomB += conflictTableEntry(
        rowHeader,
        '',
        linkTextA,
        linkReservationDayB,
        linkTextB
      )
      tableBottomBoth += conflictTableEntry(
        rowHeader,
        linkReservationDayA,
        linkTextA,
        linkReservationDayB,
        linkTextB
      )
      tableBottomOther += conflictTableEntry(
        rowHeader,
        linkCleaningA,
        linkTextA,
        linkCleaningB,
        linkTextB
      )
    }
  })

  const header =
    '<p>The following reservation days were scheduled before cleaning was enabled for your organization and have times that do not allow for the follow-up 30 minute cleaning period.  Please resolve the issue by rescheduling as soon as possible.</p>'
  const footer =
    '<p>Members that made the reservations, administrators, and cleaning staff will be informed of the conflict.</p>'

  const mg = new Mailgun({
    apiKey: keys.MAILGUN_API_KEY,
    domain: MAIL_DOMAIN,
  })
  const data = (
    emails: string[],
    tableInner: string,
    attention: string = ''
  ) => {
    return {
      from: MAIL_FROM,
      to: emails,
      subject: 'Reservation cleaning conflict',
      html: `${attention}${header}<table>${tableInner}</table>${footer}`,
    }
  }

  const emailsSend = [
    mg
      .messages()
      .send(
        data(
          adminCleaningCrewEmails,
          tableTop.concat(tableBottomOther),
          '<p>Attention: Administrators and Cleaning Staff</p>'
        )
      ),
  ]
  if (userA.email === userB.email) {
    emailsSend.push(
      mg.messages().send(data([userB.email], tableTop.concat(tableBottomBoth)))
    )
  } else {
    emailsSend.push(
      mg.messages().send(data([userA.email], tableTop.concat(tableBottomA)))
    )
    emailsSend.push(
      mg.messages().send(data([userB.email], tableTop.concat(tableBottomB)))
    )
  }
  return Promise.all(emailsSend)
}

export const sendReservationDayCancellation = (
  email: string,
  location: LocationType,
  desk: DeskType,
  timeRange: ITimeRange
) => {
  const mg = new Mailgun({
    apiKey: keys.MAILGUN_API_KEY,
    domain: MAIL_DOMAIN,
  })
  const data = {
    from: MAIL_FROM,
    to: email,
    subject: `Day canceled for desk: ${
      desk.name
    } - Reserved for ${formatReservationDay(timeRange, location.timeZone)}`,
    html: `<p>Your reservation for desk: ${
      desk.name
    }, on ${formatReservationDay(
      timeRange,
      location.timeZone
    )} has been canceled.`,
  }

  return mg.messages().send(data)
}

export const sendResetPassword = async (email: string, token: string) => {
  const mg = new Mailgun({
    apiKey: keys.MAILGUN_API_KEY,
    domain: MAIL_DOMAIN,
  })
  const data = {
    from: MAIL_FROM,
    to: email,
    subject: `Reset password for Everychair`,
    html: `<p>You've requested a password reset for your Everychair account.  Use the following link to create a new password.</p><p><a href="${linkDomain()}/change-password/${token}" target="_blank">${linkDomain()}/change-password/${token}</a></p><br/><p>This reset will expire in 3 hours.</p>`,
  }

  return mg.messages().send(data)
}

export const sendResetPasswordSuccess = async (email: string) => {
  const mg = new Mailgun({
    apiKey: keys.MAILGUN_API_KEY,
    domain: MAIL_DOMAIN,
  })
  const data = {
    from: MAIL_FROM,
    to: email,
    subject: `Everychair password changed`,
    html: `<p>Your Everychair account password has been changed successfully.</p>`,
  }

  return mg.messages().send(data)
}

// partial sync with cleaning scheduler src/clock.ts

export const sendCleaningNotices = async (
  emails: string[],
  reservationId: string,
  location: LocationType,
  desk: DeskType,
  timeRange: ITimeRange
) => {
  const mg = new Mailgun({
    apiKey: keys.MAILGUN_API_KEY,
    domain: MAIL_DOMAIN,
  })
  const data = {
    from: MAIL_FROM,
    to: emails.join(', '),
    subject: `Cleaning notice`,
    html: `<p>A <a href="${linkDomain()}/cleaning/${reservationId}/days/${
      timeRange.id
    }" target="blank">reservation for ${
      desk.name
    }</a> will be ending at ${formatTime(
      timeRange.end,
      location.timeZone
    )}.  Please attend to cleaning this desk within the 30-minute cleaning period after the reservation ends.</p><br/><p>Contact your Everychair administrator if you should not be receiving this notice.`,
  }

  return mg.messages().send(data)
}
