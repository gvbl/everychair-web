import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import ConfirmModal from '../../components/modals/ConfirmModal'
import useModalParentPath from '../../hooks/UseModalParentPath'
import { LocationParams } from '../../models/LocationParams'
import { removeLocationImage } from './locationsSlice'

const RemoveLocationImageModal = () => {
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
    const removeResultAction = await dispatch(removeLocationImage(locationId))
    if (removeLocationImage.fulfilled.match(removeResultAction)) {
      history.replace(modalParentPath)
      return
    }
    setGenericError('Unable to remove image')
  }

  return (
    <ConfirmModal
      message={`Are you sure you want to remove this image?`}
      error={genericError}
      submit={submit}
      show
      onHide={() => setGenericError(null)}
    />
  )
}

export default RemoveLocationImageModal
