import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { AppDispatch } from '../..'
import ConfirmModal from '../../components/modals/ConfirmModal'
import useModalParentPath from '../../hooks/UseModalParentPath'
import Desk from '../../models/api/Desk'
import { RootState } from '../../store'
import { useQuery } from '../../util/query'
import { deleteDesk } from './desksSlice'

const DeleteDeskModal = () => {
  const deskId = useQuery().get('deskId')
  const history = useHistory()
  const modalParentPath = useModalParentPath()

  const dispatch = useDispatch<AppDispatch>()
  const [genericError, setGenericError] = useState<string | null>(null)

  const desk = useSelector<RootState, Desk | null>((state) =>
    deskId ? state.desks.entity[deskId] : null
  )

  if (!deskId || !desk) {
    return null
  }

  const submit = async () => {
    setGenericError(null)
    const removeResultAction = await dispatch(deleteDesk(deskId))
    if (deleteDesk.fulfilled.match(removeResultAction)) {
      history.replace(modalParentPath)
      return
    }
    setGenericError('Unable to delete desk')
  }

  return (
    <ConfirmModal
      message={`Are you sure you want to delete <b>${desk.name}</b>?  Reservations of this desk will be canceled.`}
      error={genericError}
      submit={submit}
      show
      onHide={() => setGenericError(null)}
    />
  )
}

export default DeleteDeskModal
