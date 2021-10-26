import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import ConfirmModal from '../../components/modals/ConfirmModal'
import Invitation from '../../models/api/Invitation'
import { OrganizationParams } from '../../models/OrganizationParams'
import { reviveInvitation } from '../../models/revive'
import { RootState } from '../../store'
import { cancelInvitation } from './invitationsSlice'

interface CanceInvitationParams extends OrganizationParams {
  invitationId: string
}

const CancelInvitationModal = () => {
  const { organizationId, invitationId } = useParams<CanceInvitationParams>()
  const invitation = useSelector<RootState, Invitation>((state) =>
    reviveInvitation(state.invitations.entity[invitationId])
  )
  const [genericError, setGenericError] = useState<string | null>(null)
  const history = useHistory()
  const dispatch = useDispatch<AppDispatch>()

  if (!invitation) {
    return null
  }

  const submit = async () => {
    setGenericError(null)
    const cancelResultAction = await dispatch(cancelInvitation(invitation.id))
    if (cancelInvitation.fulfilled.match(cancelResultAction)) {
      history.replace(`/manage/organizations/${organizationId}/members`)
      return
    }
    setGenericError('Unable to cancel invitation')
  }

  return (
    <ConfirmModal
      message={`Are you sure you want to cancel the invitation to <b>${invitation.email}</b>?`}
      error={genericError}
      submit={submit}
      show
      onHide={() => setGenericError(null)}
    />
  )
}

export default CancelInvitationModal
