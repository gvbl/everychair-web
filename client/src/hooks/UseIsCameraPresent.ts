import { useEffect, useState } from 'react'

const useIsCameraPresent = () => {
  const [isCameraPresent, setIsCameraPresent] = useState(false)

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter(
        (device) => device.kind === 'videoinput'
      )
      if (videoDevices.length > 0) {
        setIsCameraPresent(true)
      }
    })
  }, [setIsCameraPresent])

  return isCameraPresent
}

export default useIsCameraPresent
