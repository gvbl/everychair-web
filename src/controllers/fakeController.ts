import axios from 'axios'
import bcryptjs from 'bcryptjs'
import { NextFunction, Request, Response } from 'express'
import faker from 'faker'
import { capitalize } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { DeskType } from '../models/Desk'
import { MembershipType } from '../models/Membership'
import { Plan } from '../models/Plan'
import { Role } from '../models/Role'
import { SpaceType } from '../models/Space'
import { SubscriptionStatus } from '../models/SubscriptionStatus'
import { AuthStrategy } from '../models/User'
import { createDesk } from './deskController'
import { createInvitations, oneWeekExpiration } from './invitationController'
import { createLocation } from './locationController'
import { createMembershipPop } from './membershipController'
import { createOrganization } from './organizationController'
import { createReservation } from './reservationController'
import { createSpace } from './spaceController'
import { createUser } from './userController'

const rawDeskImageUrls = `https://images.unsplash.com/photo-1519219788971-8d9797e0928e?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=640&q=80
https://images.unsplash.com/photo-1449247709967-d4461a6a6103?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=640&q=80
https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=640&q=80
https://images.unsplash.com/photo-1486946255434-2466348c2166?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=640&q=80
https://images.unsplash.com/photo-1589884629038-b631346a23c0?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=640&q=80
https://images.unsplash.com/photo-1463620695885-8a91d87c53d0?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=640&q=80
https://images.unsplash.com/photo-1570485071395-29b575ea3b4e?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=640&q=80
https://images.unsplash.com/photo-1605543667606-52b0f1ee1b72?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=640&q=80
https://images.unsplash.com/photo-1598016677484-ad34c3fd766e?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=640&q=80
https://images.unsplash.com/photo-1581374820583-317d45555a82?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=640&q=80
https://images.unsplash.com/photo-1584959367915-1904c0376f2b?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=640&q=80
https://images.unsplash.com/photo-1587258459922-4521d3704511?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=640&q=80
https://images.unsplash.com/photo-1596022326953-84f20bfebb77?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=640&q=80
https://images.unsplash.com/photo-1491336440196-6d4fee45a05e?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=640&q=80`

const deskImageUrls = rawDeskImageUrls.split('\n')

const normalizeEmail = (email: string) => {
  const parts = email.split('@')
  return `${parts[0].toLowerCase().replace('.', '')}@${parts[1]}`
}

const loadImage = async (url: string) => {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
  })
  return {
    data: Buffer.from(response.data, 'binary'),
    contentType: response.headers['Content-Type'],
  }
}

const fakeLocation = async (organizationId: string) => {
  const image = await loadImage('http://placeimg.com/640/480/arch')
  const city = faker.address.city()
  const state = faker.address.stateAbbr()
  return createLocation({
    organizationId: organizationId,
    name: `${city} Office`,
    timeZone: faker.address.timeZone(),
    image: image,
    address: {
      street: faker.address.streetAddress(),
      city: city,
      state: state,
      zip: faker.address.zipCodeByState(state),
    },
  })
}

const fakeDesks = async (count: number, space: SpaceType) => {
  let desks: DeskType[] = []
  for (let i = 0; i < count; i++) {
    const image = await loadImage(
      deskImageUrls[Math.floor(Math.random() * deskImageUrls.length)]
    )
    const desk = await createDesk({
      organizationId: space.organizationId,
      locationId: space.locationId,
      spaceId: space.id,
      name: `${capitalize(faker.commerce.color())} Desk`,
      image: image,
    })
    desks.push(desk)
  }
  return desks
}

const allDayTimeRange = (day?: number) => {
  const start = new Date()
  start.setMonth(2)
  start.setDate(day ? day : 1)
  start.setHours(9, 0, 0, 0)
  const end = new Date()
  end.setMonth(2)
  start.setDate(day ? day : 1)
  end.setHours(17, 0, 0, 0)
  return { start: start, end: end }
}

const morningTimeRange = (day?: number) => {
  const start = new Date()
  start.setMonth(2)
  start.setDate(day ? day : 1)
  start.setHours(9, 0, 0, 0)
  const end = new Date()
  end.setMonth(2)
  start.setDate(day ? day : 1)
  end.setHours(12, 0, 0, 0)
  return { start: start, end: end }
}

const afternoonTimeRange = (day?: number) => {
  const start = new Date()
  start.setMonth(2)
  start.setDate(day ? day : 1)
  start.setHours(13, 0, 0, 0)
  const end = new Date()
  end.setMonth(2)
  start.setDate(day ? day : 1)
  end.setHours(17, 0, 0, 0)
  return { start: start, end: end }
}

export const getFake = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.info('Creating owner...')
    const hash = await bcryptjs.hash('ffffffff', 10)
    const ownerEmail = normalizeEmail(faker.internet.email())
    const ownerAvatar = await loadImage(
      'https://www.thispersondoesnotexist.com/image'
    )
    const user = await createUser({
      authStrategy: AuthStrategy.LOCAL,
      email: ownerEmail,
      emailConfirmed: true,
      password: hash,
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      avatar: ownerAvatar,
    })

    console.info('Creating organization...')
    const icon = await loadImage(faker.image.business())
    const organization = await createOrganization({
      plan: Plan.ENTERPRISE,
      subscription: {
        subscriptionId: '0',
        status: SubscriptionStatus.PAID,
      },
      name: faker.company.companyName(),
      icon: icon,
      cleaning: true,
    })
    console.info('Adding owner to organization...')
    const ownerMembership = await createMembershipPop({
      user: user.id,
      organization: organization.id,
      roles: [Role.STANDARD, Role.ADMIN, Role.OWNER],
    })

    console.info('Creating members...')
    for (let i = 0; i < 2; i++) {
      const adminAvatar = await loadImage(
        'https://www.thispersondoesnotexist.com/image'
      )
      const admin = await createUser({
        authStrategy: AuthStrategy.LOCAL,
        email: normalizeEmail(faker.internet.email()),
        emailConfirmed: true,
        password: hash,
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        avatar: adminAvatar,
      })
      await createMembershipPop({
        user: admin.id,
        organization: organization.id,
        roles: [Role.ADMIN, Role.STANDARD],
      })
    }
    const memberships: MembershipType[] = []
    for (let i = 0; i < 9; i++) {
      const memberAvatar = await loadImage(
        'https://www.thispersondoesnotexist.com/image'
      )
      const member = await createUser({
        authStrategy: AuthStrategy.LOCAL,
        email: normalizeEmail(faker.internet.email()),
        emailConfirmed: true,
        password: hash,
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        avatar: memberAvatar,
      })
      const roles =
        Math.random() < 0.1 ? [Role.STANDARD, Role.CLEANING] : [Role.STANDARD]
      const membership = await createMembershipPop({
        user: member.id,
        organization: organization.id,
        roles: roles,
      })
      memberships.push(membership)
    }

    console.info('Creating invitations...')
    for (let i = 0; i < 3; i++) {
      await createInvitations([
        {
          organization: organization.id,
          email: normalizeEmail(faker.internet.email()),
          token: uuidv4(),
          expiration: oneWeekExpiration(),
        },
      ])
    }

    console.info('Creating locations, spaces, and desks...')
    const firstLocation = await fakeLocation(organization.id)
    const firstLocationFirstSpace = await createSpace({
      organizationId: organization.id,
      locationId: firstLocation.id,
      name: 'Front-end Team',
    })
    const firstLocationSecondSpace = await createSpace({
      organizationId: organization.id,
      locationId: firstLocation.id,
      name: 'QA Team',
    })
    const secondLocation = await fakeLocation(organization.id)
    const secondLocationSpace = await createSpace({
      organizationId: organization.id,
      locationId: secondLocation.id,
      name: '2nd Floor - Engineering',
    })

    const firstDesks = await fakeDesks(7, firstLocationFirstSpace)
    await fakeDesks(3, firstLocationSecondSpace)
    await fakeDesks(12, secondLocationSpace)

    console.info('Creating reservations')
    for (let i = 0; i < 10; i++) {
      const day = Math.random() * 28
      const ownerReservationDesk =
        firstDesks[Math.floor(Math.random() * firstDesks.length)]
      let timeRange =
        Math.random() < 0.5 ? morningTimeRange(day) : afternoonTimeRange(day)
      timeRange = Math.random() < 0.5 ? allDayTimeRange(day) : timeRange
      await createReservation({
        userId: ownerMembership.user as string,
        membershipId: ownerMembership.id,
        organizationId: ownerReservationDesk.organizationId,
        locationId: ownerReservationDesk.locationId,
        spaceId: ownerReservationDesk.spaceId,
        deskId: ownerReservationDesk.id,
        timeRanges: [timeRange],
      })
    }

    for (let i = 0; i < 10; i++) {
      const reservationMembership =
        memberships[Math.floor(Math.random() * memberships.length)]
      const reservationDesk =
        firstDesks[Math.floor(Math.random() * firstDesks.length)]
      let timeRange =
        Math.random() < 0.5 ? morningTimeRange() : afternoonTimeRange()
      timeRange = Math.random() < 0.5 ? allDayTimeRange() : timeRange
      await createReservation({
        userId: reservationMembership.user as string,
        membershipId: reservationMembership.id,
        organizationId: reservationDesk.organizationId,
        locationId: reservationDesk.locationId,
        spaceId: reservationDesk.spaceId,
        deskId: reservationDesk.id,
        timeRanges: [timeRange],
      })
    }

    res.send(`Successfully created ${ownerEmail}`)
  } catch (err: any) {
    next(err)
  }

  // add fake reservations
}
