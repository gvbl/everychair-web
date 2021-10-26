import React from 'react'
import { Badge } from 'react-bootstrap'
import SprayBottle from '../../components/icons/SprayBottle'
import { plusThirtyMinutes } from '../../util/date'
import { formatTimeRange } from '../../util/text'

interface CleaningDeskListItem {
  start: Date
}

const CleaningDeskListItem = ({ start }: CleaningDeskListItem) => {
  return (
    <div className="d-flex align-items-center" style={{ flexGrow: 1 }}>
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          width: '2.75rem',
          height: '2.75rem',
          backgroundColor: 'darkgray',
          borderRadius: '50%',
        }}
      >
        <SprayBottle color="white" size={26} />
      </div>
      <div style={{ marginLeft: '0.5rem' }}>
        <Badge variant="success">Cleaning</Badge>
        <br />
        <small>
          {formatTimeRange({ start: start, end: plusThirtyMinutes(start) })}
        </small>
      </div>
    </div>
  )
}

export default CleaningDeskListItem
