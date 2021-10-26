import React from 'react'
import { Card } from 'react-bootstrap'
import Desk from '../../models/api/Desk'
import DeskCard from './DeskCard'
import DeskEditMenu from './DeskEditMenu'

interface DeskListItemProps {
  desk: Desk
  onDeleteDesk: (deskId: string) => void
}

const DeskListItem = ({ desk, onDeleteDesk }: DeskListItemProps) => {
  return (
    <DeskCard
      desk={desk}
      imageOverlay={
        <Card.ImgOverlay>
          <DeskEditMenu
            style={{ position: 'absolute', top: '.1rem', right: '.1rem' }}
            onDelete={() => onDeleteDesk(desk.id)}
          />
        </Card.ImgOverlay>
      }
    />
  )
}

export default DeskListItem
