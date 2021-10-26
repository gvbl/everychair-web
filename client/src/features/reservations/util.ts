import Desk from '../../models/api/Desk'
import Location from '../../models/api/Location'
import Organization from '../../models/api/Organization'
import Space from '../../models/api/Space'
import { SubscriptionStatus } from '../../models/api/SubscriptionStatus'
import { DeskSelectorIds } from './reservemodal/DeskSelector'

const filterLocationsByOrganizationId = (
  locations: Location[],
  organizationId: string
) => {
  return locations.filter(
    (location) => location.organizationId === organizationId
  )
}

const filterSpacesByLocationId = (spaces: Space[], locationId: string) => {
  return spaces.filter((space) => space.locationId === locationId)
}

const filterDesksBySpaceId = (desks: Desk[], spaceId: string) => {
  return desks.filter((desk) => desk.spaceId === spaceId)
}

export const autoForward = (
  ids: DeskSelectorIds,
  organizations: Organization[],
  locations: Location[],
  spaces: Space[],
  desks: Desk[]
) => {
  if (
    organizations.filter(
      (organization) =>
        organization.subscription?.status === SubscriptionStatus.PAYMENT_FAILED
    ).length > 0
  ) {
    return ids
  }
  if (
    !ids.organizationId &&
    organizations.length === 1 &&
    filterLocationsByOrganizationId(locations, organizations[0].id).length > 0
  ) {
    ids.organizationId = organizations[0].id
  }
  if (ids.organizationId && !ids.locationId) {
    const organizationLocations = filterLocationsByOrganizationId(
      locations,
      ids.organizationId
    )
    if (
      organizationLocations.length === 1 &&
      filterSpacesByLocationId(spaces, organizationLocations[0].id).length > 0
    ) {
      ids.locationId = organizationLocations[0].id
    }
  }
  if (ids.locationId && !ids.spaceId) {
    const locationSpaces = filterSpacesByLocationId(spaces, ids.locationId)
    if (
      locationSpaces.length === 1 &&
      filterDesksBySpaceId(desks, locationSpaces[0].id).length > 0
    ) {
      ids.spaceId = locationSpaces[0].id
    }
  }
  return ids
}
