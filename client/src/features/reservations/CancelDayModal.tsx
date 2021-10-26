import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import ConfirmModal from '../../components/modals/ConfirmModal'
import { TimeRange } from '../../models/api/Reservation'
import { reviveReservation } from '../../models/revive'
import { RootState } from '../../store'
import { formatDayLong } from '../../util/text'
import { cancelDay, cancelReservation } from './reservationsSlice'

export interface CancelDayData {
  reservationId: string
  timeRangeId: string
}

interface CancelDayParams {
  reservationId: string
  timeRangeId: string
}

interface CancelDayModalSelected {
  timeRange?: TimeRange
  timeRanges: TimeRange[]
}

const CancelDayModal = () => {
  const { reservationId, timeRangeId } = useParams<CancelDayParams>()
  const { timeRange, timeRanges } = useSelector<
    RootState,
    CancelDayModalSelected
  >((state) => {
    const rawReservation = state.reservations.entity[reservationId]
    const reservation = rawReservation
      ? reviveReservation(rawReservation)
      : undefined
    return {
      timeRange: reservation?.timeRanges.find(
        (timeRange) => timeRange.id === timeRangeId
      ),
      timeRanges: reservation ? reservation.timeRanges : [],
    }
  })
  const [genericError, setGenericError] = useState<string | null>(null)
  const history = useHistory()
  const dispatch = useDispatch<AppDispatch>()

  if (!timeRange) {
    return null
  }

  const submitCancelReservation = async () => {
    setGenericError(null)
    const cancelReservationAction = await dispatch(
      cancelReservation(reservationId)
    )
    if (cancelReservation.fulfilled.match(cancelReservationAction)) {
      history.replace(`/reservations`)
      return
    }
    setGenericError('Unable to cancel day')
  }

  const submitCancelDay = async () => {
    setGenericError(null)
    const cancelDayAction = await dispatch(
      cancelDay({
        reservationId: reservationId,
        timeRangeId: timeRangeId,
      })
    )
    if (cancelDay.fulfilled.match(cancelDayAction)) {
      history.replace(`/reservations`)
      return
    }
    setGenericError('Unable to cancel day')
  }

  const submit = async () => {
    if (timeRanges.length === 1) {
      submitCancelReservation()
    } else {
      submitCancelDay()
    }
  }

  return (
    <ConfirmModal
      message={`Are you sure you want to cancel your reservation on <b>${formatDayLong(
        timeRange.start,
        false
      )}</b>?`}
      error={genericError}
      submit={submit}
      show
      onHide={() => setGenericError(null)}
    />
  )
}

export default CancelDayModal
