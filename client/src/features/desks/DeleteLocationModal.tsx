import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import ConfirmModal from '../../components/modals/ConfirmModal'
import Location from '../../models/api/Location'
import { LocationParams } from '../../models/LocationParams'
import { RootState } from '../../store'
import { deleteLocation } from './locationsSlice'

const DeleteLocationModal = () => {
  const { organizationId, locationId } = useParams<LocationParams>()
  const history = useHistory()
  const dispatch = useDispatch<AppDispatch>()
  const [genericError, setGenericError] = useState<string | null>(null)

  const location = useSelector<RootState, Location | null>((state) =>
    locationId ? state.locations.entity[locationId] : null
  )

  if (!location) {
    return null
  }

  const submit = async () => {
    setGenericError(null)
    const resultAction = await dispatch(deleteLocation(locationId))
    if (deleteLocation.fulfilled.match(resultAction)) {
      history.replace(`/manage/organizations/${organizationId}/desks`)
      return
    }
    setGenericError('Unable to delete location')
  }

  return (
    <ConfirmModal
      message={`Are you sure you want to delete <b>${location.name}</b>?  All spaces and desks at this location will also be deleted.  Reservations of these desks will be canceled.`}
      error={genericError}
      submit={submit}
      show
      onHide={() => setGenericError(null)}
    />
  )
}

export default DeleteLocationModal
