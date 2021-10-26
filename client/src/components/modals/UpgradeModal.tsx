import React from 'react'
import { Button } from 'react-bootstrap'
import { useHistory, useParams } from 'react-router-dom'
import useModalParentPath from '../../hooks/UseModalParentPath'
import { OrganizationParams } from '../../models/OrganizationParams'
import GenericModal from './GenericModal'

interface UpgradeModalProps {
  message: string
  show: boolean
}

const UpgradeModal = ({ message, show }: UpgradeModalProps) => {
  const { organizationId } = useParams<OrganizationParams>()
  const history = useHistory()
  const modalParentPath = useModalParentPath()

  return (
    <GenericModal
      title="Upgrade"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => history.replace(modalParentPath)}
          >
            Close
          </Button>
          <Button
            onClick={() => history.push(`/change-plan/${organizationId}`)}
          >
            Upgrade
          </Button>
        </>
      }
      show={show}
    >
      {message}
    </GenericModal>
  )
}

export default UpgradeModal
