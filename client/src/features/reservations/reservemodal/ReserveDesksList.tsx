import React, { useEffect } from 'react'
import { ListGroup } from 'react-bootstrap'
import Desk from '../../../models/api/Desk'
import ReserveDeskListItem from './ReserveDeskListItem'
import './ReserveList.css'

interface ReserveDesksListProps {
  desks: Desk[]
  deskConflictMap: Record<string, boolean>
  onDeskSelected: (deskId?: string) => void
  selectedId?: string
}

const ReserveDesksList = ({
  desks,
  deskConflictMap,
  onDeskSelected,
  selectedId,
}: ReserveDesksListProps) => {
  useEffect(() => {
    if (selectedId && deskConflictMap[selectedId]) {
      onDeskSelected(undefined)
    }
  }, [selectedId, deskConflictMap, onDeskSelected])

  const renderedDesks = desks.map((desk) => (
    <ReserveDeskListItem
      desk={desk}
      disabled={deskConflictMap[desk.id]}
      key={desk.id}
      onClick={onDeskSelected}
      selectedId={selectedId}
    />
  ))

  return (
    <ListGroup
      className="reserve-list flex-wrap"
      style={{
        display: 'grid',
        justifyItems: 'center',
        columnGap: '0.5rem',
        rowGap: '0.5rem',
        gridTemplateColumns: 'repeat(auto-fill, minmax(7rem, 1fr))',
      }}
    >
      {renderedDesks}
    </ListGroup>
  )
}

export default ReserveDesksList
