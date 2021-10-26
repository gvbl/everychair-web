import React, { useState } from 'react'
import { Alert, Button, Modal } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'
import EmailConfirmationButton from '../../components/EmailConfirmationButton'
import useModalParentPath from '../../hooks/UseModalParentPath'
import { Loading } from '../../models/Loading'

const EmailConfirmationModal = () => {
  const history = useHistory()
  const modalParentPath = useModalParentPath()

  const [emailConfirmationLoading, setEmailConfirmationLoading] = useState(
    Loading.IDLE
  )

  const done = () => {
    history.replace(modalParentPath)
    setEmailConfirmationLoading(Loading.IDLE)
  }

  return (
    <Modal
      animation={false}
      show
      dialogClassName="alert"
      onHide={done}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm email</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {emailConfirmationLoading === Loading.SUCCEEDED && (
          <Alert variant="success">Email sent, check your inbox.</Alert>
        )}
        {emailConfirmationLoading === Loading.FAILED && (
          <Alert variant="danger">Unable to send confirmation.</Alert>
        )}
        You must confirm your email before inviting others to your organization.
      </Modal.Body>
      <Modal.Footer>
        {emailConfirmationLoading === Loading.SUCCEEDED ? (
          <Button onClick={done}>Done</Button>
        ) : (
          <EmailConfirmationButton
            onLoadingChanged={setEmailConfirmationLoading}
          />
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default EmailConfirmationModal
