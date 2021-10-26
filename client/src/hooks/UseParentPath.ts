import { useEffect, useState } from 'react'
import {
  generatePath,
  matchPath,
  useLocation,
  useParams,
} from 'react-router-dom'

const ParentPathMap: Record<string, string> = {
  '/manage/organizations/:organizationId/members/invitations/:invitationId':
    '/manage/organizations/:organizationId/members',
  '/manage/organizations/:organizationId/members/:membershipId':
    '/manage/organizations/:organizationId/members',
  '/manage/organizations/:organizationId/desks/locations/:locationId/spaces/:spaceId':
    '/manage/organizations/:organizationId/desks',
  '/manage/organizations/:organizationId/desks/locations/:locationId':
    '/manage/organizations/:organizationId/desks',
  '/reservations/:reservationId/days/:timeRangeId': '/reservations',
  '/schedule/organizations/:organizationId/locations/:locationId': '/schedule',
}

const useParentPath = () => {
  const urlLocation = useLocation()
  const params = useParams<{
    organizationId: string
    invitationId: string
    membershipId: string
    locationId: string
    spaceId: string
    reservationId: string
    timeRangeId: string
  }>()

  const [parentPath, setParentPath] = useState<string>('')

  useEffect(() => {
    const childPaths = Object.keys(ParentPathMap)
    let path = ''
    for (let i = 0; i < childPaths.length; i++) {
      const match = matchPath(urlLocation.pathname, { path: childPaths[i] })
      if (match) {
        path = generatePath(ParentPathMap[match.path], params)
        break
      }
    }
    setParentPath(path)
  }, [urlLocation.pathname, params, parentPath, setParentPath])

  return parentPath
}

export default useParentPath
