import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { AppDispatch } from '../..'
import ConfirmModal from '../../components/modals/ConfirmModal'
import useModalParentPath from '../../hooks/UseModalParentPath'
import { Role } from '../../models/api/Role'
import { RootState } from '../../store'
import { removeAvatar } from '../app/userSlice'
import { syncSelfMemberAvatarUrl } from '../members/membersSlice'

interface RemoveAvatarSelected {
  userId?: string
  isAdmin: boolean
  selfMembershipIds: string[]
}

const RemoveAvatarModal = () => {
  const history = useHistory()
  const dispatch = useDispatch<AppDispatch>()
  const modalParentPath = useModalParentPath()

  const [genericError, setGenericError] = useState<string | null>(null)

  const { userId, isAdmin, selfMembershipIds } = useSelector<
    RootState,
    RemoveAvatarSelected
  >((state) => {
    const userId = state.user.entity?.id
    return {
      userId: userId,
      isAdmin:
        Object.values(state.memberships.entity).filter((membership) =>
          membership.roles.includes(Role.ADMIN)
        ).length > 0,
      selfMembershipIds: Object.values(state.members.entity)
        .filter((member) => member.userId === userId)
        .map((member) => member.membershipId),
    }
  })

  if (!userId) {
    return null
  }

  const submit = async () => {
    setGenericError(null)
    const removeResultAction = await dispatch(removeAvatar(userId))
    if (removeAvatar.fulfilled.match(removeResultAction)) {
      if (isAdmin) {
        for (let i = 0; i < selfMembershipIds.length; i++) {
          await dispatch(
            syncSelfMemberAvatarUrl({
              membershipId: selfMembershipIds[i],
              avatarUrl: undefined,
            })
          )
        }
      }
      history.replace(modalParentPath)
      return
    }
    setGenericError('Unable to remove avatar')
  }

  return (
    <ConfirmModal
      message={`Are you sure you want to remove your avatar?`}
      error={genericError}
      submit={submit}
      show
      onHide={() => setGenericError(null)}
    />
  )
}

export default RemoveAvatarModal
