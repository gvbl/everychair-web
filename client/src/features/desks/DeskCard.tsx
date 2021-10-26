import React, { ReactNode } from 'react'
import { Card } from 'react-bootstrap'
import { Laptop } from 'react-bootstrap-icons'
import Desk from '../../models/api/Desk'

interface DeskCardProps extends React.HTMLAttributes<HTMLElement> {
  desk: Partial<Desk>
  large?: boolean
  disabled?: boolean
  imageOverlay?: ReactNode
  onClick?: () => void
}

const DeskCard = ({
  desk,
  large = false,
  disabled = false,
  imageOverlay,
  onClick,
  ...props
}: DeskCardProps) => {
  return (
    <Card
      {...props}
      style={{
        width: large ? '21rem' : '7rem',
        height: large ? '33rem' : '11rem',
        backgroundColor: 'transparent',
      }}
      onClick={onClick}
    >
      {desk.imageUrl ? (
        <Card.Img
          alt="Desk"
          variant="top"
          style={{
            width: 'auto',
            height: large ? '24rem' : '8rem',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: disabled ? '0.3' : '1',
          }}
          src={desk.imageUrl}
        />
      ) : (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            width: 'auto',
            height: large ? '24rem' : '8rem',
            backgroundColor: 'darkgray',
            borderTopLeftRadius: '0.25rem',
            borderTopRightRadius: '0.25rem',
            opacity: disabled ? '0.3' : '1',
          }}
        >
          <Laptop color="white" size={large ? 192 : 64} />
        </div>
      )}
      {imageOverlay}
      <Card.Body
        className="justify-content-center"
        style={{
          padding: large ? '1.75rem' : '0.5rem',
        }}
      >
        <span
          className={disabled ? 'disabled' : 'text-contained'}
          style={large ? { fontSize: '2rem' } : {}}
        >
          {desk.name}
        </span>
      </Card.Body>
    </Card>
  )
}

export default DeskCard
