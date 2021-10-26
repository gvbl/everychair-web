import React, { useEffect } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { useHistory } from 'react-router-dom'
import useModalParentPath from '../../hooks/UseModalParentPath'
import LoadingButton from '../LoadingButton'
import GenericModal from './GenericModal'

interface ConfirmModalProps {
  message: string
  error: string | null
  submit: () => void
  show: boolean
  onHide?: () => void
}

const ConfirmModal = ({
  message,
  error,
  submit,
  show,
  onHide,
}: ConfirmModalProps) => {
  const history = useHistory()
  const modalParentPath = useModalParentPath()

  const { handleSubmit, formState, reset } = useForm()

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset()
    }
  }, [formState.isSubmitSuccessful, reset])

  return (
    <GenericModal
      title="Confirm"
      footer={
        <>
          <LoadingButton
            type="submit"
            loading={formState.isSubmitting}
            onClick={() => handleSubmit(submit)()}
          >
            Confirm
          </LoadingButton>
          <Button
            variant="secondary"
            onClick={() => {
              if (onHide) {
                onHide()
              }
              reset()
              history.replace(modalParentPath)
            }}
          >
            Close
          </Button>
        </>
      }
      show={show}
      onHide={() => {
        if (onHide) {
          onHide()
        }
        reset()
      }}
    >
      {error && <Alert variant="danger">{error}</Alert>}
      <Form>
        <span dangerouslySetInnerHTML={{ __html: message }} />
      </Form>
    </GenericModal>
  )
}

export default ConfirmModal
