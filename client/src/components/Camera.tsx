import React, { useEffect, useRef, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'

interface CameraProps extends React.HTMLAttributes<HTMLElement> {
  onPhotograph: (blob: Blob) => void
}

const Camera = ({ onPhotograph, style, ...props }: CameraProps) => {
  const [isStarting, setIsStarting] = useState(false)
  const [isPortrait, setIsPortrait] = useState(true)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleCanPlay = () => {
    if (videoRef.current) {
      setIsPortrait(videoRef.current.videoHeight > videoRef.current.videoWidth)
      videoRef.current.play()
    }
  }

  const startCamera = async () => {
    if (videoRef.current?.srcObject) {
      return
    }
    try {
      setIsStarting(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'environment' },
      })
      if (stream && videoRef.current && !videoRef.current.srcObject) {
        videoRef.current.srcObject = stream
      }
      setIsStarting(false)
    } catch (err) {
      console.error('Error starting camera:', err)
    }
  }

  const stopCamera = () => {
    if (!videoRef.current) {
      return
    }
    const stream = videoRef.current.srcObject as MediaStream
    if (!stream) {
      return
    }
    stream.getTracks().forEach((track) => {
      track.stop()
    })
    videoRef.current.srcObject = null
  }

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const getDimensions = () => {
    if (!videoRef.current) {
      return { width: 0, height: 0 }
    }
    const width = videoRef.current.videoWidth
    const height = videoRef.current.videoHeight
    return { width: width, height: height }
  }

  const takePhoto = () => {
    if (!videoRef.current) {
      return
    }
    if (!canvasRef.current) {
      return
    }
    var context = canvasRef.current.getContext('2d')
    if (!context) {
      return
    }
    const { width, height } = getDimensions()
    canvasRef.current.width = width
    canvasRef.current.height = height
    context.drawImage(videoRef.current, 0, 0, width, height)
    canvasRef.current.toBlob((blob) => {
      if (!blob) {
        return
      }
      onPhotograph(blob)
    })
  }

  return (
    <div
      {...props}
      style={{ position: 'absolute', width: '100%', height: '16rem' }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translateX(-50%)',
          bottom: '1rem',
        }}
      >
        <Spinner animation="border" hidden={!isStarting} />
      </div>
      <canvas ref={canvasRef} hidden={true} />
      <video
        ref={videoRef}
        onCanPlay={handleCanPlay}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute',
          width: '100%',
          height: '16rem',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: '1rem',
        }}
        hidden={isStarting}
      >
        <Button
          variant="light"
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
          }}
          onClick={takePhoto}
        />
        <div
          style={{
            position: 'absolute',
            width: '2.25rem',
            height: '2.25rem',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            border: '1px solid black',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          width: '13.25rem',
          height: '16rem',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          border: '1px solid yellow',
          pointerEvents: 'none',
        }}
        hidden={isStarting || isPortrait}
      />
    </div>
  )
}

export default Camera
