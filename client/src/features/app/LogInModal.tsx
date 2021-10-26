import React from 'react'
import GenericModal from '../../components/modals/GenericModal'
import { LogInForm } from './AuthForm'

interface LogInModalProps {
  origin: string
}

const LogInModal = ({ origin }: LogInModalProps) => {
  return (
    <GenericModal title="Log in" show>
      <LogInForm origin={origin} />
    </GenericModal>
  )
}

export default LogInModal
