import React, { PropsWithChildren } from 'react'
import { Modal } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'
import useModalParentPath from '../../hooks/UseModalParentPath'

interface GenericModalProps {
  title: string
  footer?: JSX.Element
  show: boolean
  dialogClassName?: string
  scrollable?: boolean
  onHide?: () => void
}

const GenericModal = ({
  title,
  footer,
  show,
  dialogClassName,
  scrollable,
  onHide,
  children,
}: PropsWithChildren<GenericModalProps>) => {
  const history = useHistory()
  const modalParentPath = useModalParentPath()

  return (
    <Modal
      animation={false}
      show={show}
      scrollable={scrollable ?? false}
      dialogClassName={dialogClassName}
      onHide={() => {
        if (onHide) {
          onHide()
        }
        history.replace(modalParentPath)
      }}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      {footer && <Modal.Footer>{footer}</Modal.Footer>}
    </Modal>
  )
}

export default GenericModal
