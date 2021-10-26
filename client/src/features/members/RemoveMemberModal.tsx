import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import ConfirmModal from '../../components/modals/ConfirmModal'
import Member from '../../models/api/Member'
import { MemberParams } from '../../models/MemberParams'
import { RootState } from '../../store'
import { removeMember } from './membersSlice'

const RemoveMemberModal = () => {
  const { organizationId, membershipId } = useParams<MemberParams>()
  const dispatch = useDispatch<AppDispatch>()
  const history = useHistory()

  const member = useSelector<RootState, Member>(
    (state) => state.members.entity[membershipId]
  )
  const [genericError, setGenericError] = useState<string | null>(null)

  if (!member) {
    return null
  }

  const submit = async () => {
    setGenericError(null)
    const resultAction = await dispatch(removeMember(member.membershipId))
    if (removeMember.fulfilled.match(resultAction)) {
      history.replace(`/manage/organizations/${organizationId}/members`)
      return
    }
    setGenericError('Unable to remove member')
  }

  return (
    <ConfirmModal
      message={`Are you sure you want to remove <b>${member.email}</b>?`}
      error={genericError}
      submit={submit}
      show
      onHide={() => setGenericError(null)}
    />
  )
}

export default RemoveMemberModal
