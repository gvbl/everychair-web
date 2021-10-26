import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import Desk from '../../models/api/Desk'
import DeskListItem from './DeskListItem'

interface DesksListProps {
  desks: Desk[]
}

const DesksList = ({ desks }: DesksListProps) => {
  const history = useHistory()
  const urlLocation = useLocation()

  const handleDeleteDesk = (deskId: string) => {
    history.push(`${urlLocation.pathname}/delete-desk?deskId=${deskId}`)
  }

  const renderedDesks = desks.map((desk) => (
    <DeskListItem desk={desk} key={desk.id} onDeleteDesk={handleDeleteDesk} />
  ))

  return (
    <>
      <div
        style={{
          display: 'grid',
          justifyItems: 'center',
          columnGap: '0.5rem',
          rowGap: '0.5rem',
          gridTemplateColumns: 'repeat(auto-fill, minmax(7rem, 1fr))',
        }}
      >
        {renderedDesks}
      </div>
    </>
  )
}

export default DesksList
