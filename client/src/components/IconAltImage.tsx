import React, { ReactNode } from 'react'
import { Image } from 'react-bootstrap'

export enum Shape {
  Rounded = 'rounded',
  RoundedCircle = 'roundedCircle',
  Thumbnail = 'thumbnail',
}

interface IconAltImageProps extends React.HTMLAttributes<HTMLElement> {
  title: string
  src?: string
  width: string
  height: string
  icon: ReactNode
  shape?: Shape
}

const IconAltImage = ({
  title,
  src,
  width,
  height,
  icon,
  shape,
  ...props
}: IconAltImageProps) => {
  return (
    <div {...props}>
      {src ? (
        <Image
          alt={title}
          style={{
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
      ) : (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            width: width,
            minWidth: width,
            height: height,
            backgroundColor: 'darkgray',
            borderRadius: shape === Shape.RoundedCircle ? '50%' : '.25rem',
          }}
        >
          {icon}
        </div>
      )}
    </div>
  )
}

export default IconAltImage
