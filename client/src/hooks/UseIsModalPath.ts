import { useEffect, useState } from 'react'
import { matchPath, useLocation } from 'react-router-dom'
import ModalPaths from './ModalPaths'

const useIsModalPath = () => {
  const urlLocation = useLocation()

  const [isModalPath, setIsModalPath] = useState(false)

  useEffect(() => {
    let isMatch = false
    for (let i = 0; i < ModalPaths.length; i++) {
      const match = matchPath(urlLocation.pathname, { path: ModalPaths[i] })
      if (match) {
        isMatch = true
        break
      }
    }
    setIsModalPath(isMatch)
  }, [urlLocation.pathname, setIsModalPath])

  return isModalPath
}

export default useIsModalPath
