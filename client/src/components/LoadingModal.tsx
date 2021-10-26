import React from 'react'
import { Alert } from 'react-bootstrap'
import AbsoluteSpinner from './AbsoluteSpinner'
import GenericModal from './modals/GenericModal'

interface LoadingModalProps {
  title: string
  error?: boolean
}

const LoadingModal = ({ title, error = false }: LoadingModalProps) => {
  if (error) {
    return (
      <GenericModal title={title} show>
        <div style={{ height: '10rem' }}>
          <Alert variant="danger">Something went wrong</Alert>
        </div>
      </GenericModal>
    )
  } else {
    return (
      <GenericModal title={title} show>
        <div style={{ height: '10rem' }}>
          <AbsoluteSpinner />
        </div>
      </GenericModal>
    )
  }
}

export default LoadingModal
