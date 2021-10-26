import { useEffect, useRef, useState } from 'react'
import {
  generatePath,
  matchPath,
  useLocation,
  useParams,
} from 'react-router-dom'
import ModalState from '../features/app/ModalState'
import ModalPaths, { upOnePath } from './ModalPaths'
import { Location } from 'history'

const useModalParentPath = () => {
  const urlLocation = useLocation<ModalState>()
  const params = useParams<{
    organizationId: string
    invitationId: string
    membershipId: string
    locationId: string
    spaceId: string
    reservationId: string
    timeRangeId: string
  }>()

  const [modalParentPath, setModalParentPath] = useState<string>('')
  const backgroundRef = useRef<Location<unknown> | undefined>(
    urlLocation.state?.background
  )

  useEffect(() => {
    backgroundRef.current = urlLocation.state?.background
  }, [urlLocation.state])

  useEffect(() => {
    if (backgroundRef.current) {
      setModalParentPath(
        `${backgroundRef.current.pathname}${backgroundRef.current.search ?? ''}`
      )
      return
    }
    let path = ''
    for (let i = 0; i < ModalPaths.length; i++) {
      const match = matchPath(urlLocation.pathname, { path: ModalPaths[i] })
      if (match) {
        path = generatePath(upOnePath(match.path), params)
        break
      }
    }
    setModalParentPath(path)
  }, [urlLocation.pathname, backgroundRef, params, setModalParentPath])

  return modalParentPath
}

export default useModalParentPath
