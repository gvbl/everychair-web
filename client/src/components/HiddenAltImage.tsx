import React from 'react'
import { Image } from 'react-bootstrap'
import CSS from 'csstype'

export enum Shape {
  Rounded = 'rounded',
  RoundedCircle = 'roundedCircle',
  Thumbnail = 'thumbnail',
}

interface HiddenAltImageProps {
  title: string
  src?: string
  width: string
  height: string
  shape?: Shape
  style?: CSS.Properties
}

const HiddenAltImage = ({
  title,
  src,
  width,
  height,
  shape,
  style,
}: HiddenAltImageProps) => {
  return (
    <>
      {src && (
        <Image
          alt={title}
          style={{
            ...style,
            width: width,
            height: height,
            objectFit: 'cover',
            objectPosition: 'center',
          }}
          src={src}
          rounded={shape === Shape.Rounded}
          roundedCircle={shape === Shape.RoundedCircle}
          thumbnail={shape === Shape.Thumbnail}
        />
      )}
    </>
  )
}

export default HiddenAltImage
