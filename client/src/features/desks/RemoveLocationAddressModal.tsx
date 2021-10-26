import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import ConfirmModal from '../../components/modals/ConfirmModal'
import useModalParentPath from '../../hooks/UseModalParentPath'
import { LocationParams } from '../../models/LocationParams'
import { removeLocationAddress } from './locationsSlice'

const RemoveLocationAddressModal = () => {
  const { locationId } = useParams<LocationParams>()
  const history = useHistory()
  const modalParentPath = useModalParentPath()

  const dispatch = useDispatch<AppDispatch>()
  const [genericError, setGenericError] = useState<string | null>(null)

  if (!locationId) {
    return null
  }

  const submit = async () => {
    setGenericError(null)
    const removeResultAction = await dispatch(removeLocationAddress(locationId))
    if (removeLocationAddress.fulfilled.match(removeResultAction)) {
      history.replace(modalParentPath)
      return
    }
    setGenericError('Unable to remove location address')
  }

  return (
    <ConfirmModal
      message={`Are you sure you want to remove this address?`}
      error={genericError}
      submit={submit}
      show
      onHide={() => setGenericError(null)}
    />
  )
}

export default RemoveLocationAddressModal
