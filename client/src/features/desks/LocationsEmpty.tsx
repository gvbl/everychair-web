import React from 'react'
import AddLocationButton from './AddLocationButton'

const ReservationDaysEmpty = () => {
  return (
    <div className="d-flex h-100">
      <div className="center-relative">
        <h1>Locations</h1>
        <p>No locations.</p>
        <p>
          <AddLocationButton />
        </p>
      </div>
    </div>
  )
}

export default ReservationDaysEmpty
