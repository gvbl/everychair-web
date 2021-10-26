import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import ConfirmModal from '../../components/modals/ConfirmModal'
import Space from '../../models/api/Space'
import { SpaceParams } from '../../models/SpaceParams'
import { RootState } from '../../store'
import { deleteSpace } from './spacesSlice'

const DeleteSpaceModal = () => {
  const { organizationId, locationId, spaceId } = useParams<SpaceParams>()
  const history = useHistory()
  const dispatch = useDispatch<AppDispatch>()
  const [genericError, setGenericError] = useState<string | null>(null)

  const space = useSelector<RootState, Space | null>((state) =>
    spaceId ? state.spaces.entity[spaceId] : null
  )

  if (!spaceId || !space) {
    return null
  }

  const submit = async () => {
    setGenericError(null)
    const removeResultAction = await dispatch(deleteSpace(spaceId))
    if (deleteSpace.fulfilled.match(removeResultAction)) {
      history.replace(
        `/manage/organizations/${organizationId}/desks/locations/${locationId}`
      )
      return
    }
    setGenericError('Unable to delete space')
  }

  return (
    <ConfirmModal
      message={`Are you sure you want to delete <b>${space.name}</b>?  All desks in this space will also be deleted.  Reservations of these desks will be canceled.`}
      error={genericError}
      submit={submit}
      show
      onHide={() => setGenericError(null)}
    />
  )
}

export default DeleteSpaceModal
