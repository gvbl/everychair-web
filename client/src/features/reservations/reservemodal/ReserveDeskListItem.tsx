import React, { useEffect } from 'react'
import { ListGroup } from 'react-bootstrap'
import Desk from '../../../models/api/Desk'
import DeskCard from '../../desks/DeskCard'

interface ReserveDeskListItemProps {
  desk: Desk
  disabled: boolean
  onClick?: (deskId: string) => void
  selectedId?: string
}

const ReserveDeskListItem = ({
  desk,
  disabled,
  onClick,
  selectedId,
}: ReserveDeskListItemProps) => {
  const itemRef = React.useRef<HTMLDivElement>(null)
  const isActive = desk.id === selectedId

  useEffect(() => {
    if (!itemRef.current) {
      return
    }
    if (isActive) {
      itemRef.current.scrollIntoView({ block: 'nearest' })
    }
  }, [itemRef, isActive])

  return (
    <ListGroup.Item
      as="div"
      ref={itemRef}
      disabled={disabled}
      action
      active={isActive}
      style={{
        cursor: 'pointer',
        padding: '0.5rem',
        margin: '0',
        width: 'auto',
        borderStyle: 'none',
        borderRadius: '0.25rem',
      }}
      variant="light"
    >
      <DeskCard
        desk={desk}
        disabled={disabled}
        onClick={() => {
          if (onClick) {
            onClick(desk.id)
          }
        }}
      />
    </ListGroup.Item>
  )
}

export default ReserveDeskListItem
