import React from 'react'
import ReserveButton from './ReserveButton'

const MyReservationsEmpty = () => {
  return (
    <div className="d-flex h-100">
      <div className="center-relative">
        <h1>My reservations</h1>
        <p>No upcoming reservations.</p>
        <p>
          <ReserveButton />
        </p>
      </div>
    </div>
  )
}

export default MyReservationsEmpty
