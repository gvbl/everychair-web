import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import ConfirmModal from '../../components/modals/ConfirmModal'
import useModalParentPath from '../../hooks/UseModalParentPath'
import { OrganizationParams } from '../../models/OrganizationParams'
import { removeOrganizationIcon } from '../app/membershipsSlice'

const RemoveOrganizationIconModal = () => {
  const { organizationId } = useParams<OrganizationParams>()
  const history = useHistory()
  const modalParentPath = useModalParentPath()

  const dispatch = useDispatch<AppDispatch>()
  const [genericError, setGenericError] = useState<string | null>(null)

  if (!organizationId) {
    return null
  }

  const submit = async () => {
    setGenericError(null)
    const removeResultAction = await dispatch(
      removeOrganizationIcon(organizationId)
    )
    if (removeOrganizationIcon.fulfilled.match(removeResultAction)) {
      history.replace(modalParentPath)
      return
    }
    setGenericError('Unable to remove icon')
  }

  return (
    <ConfirmModal
      message={`Are you sure you want to remove this icon?`}
      error={genericError}
      submit={submit}
      show
      onHide={() => setGenericError(null)}
    />
  )
}

export default RemoveOrganizationIconModal
