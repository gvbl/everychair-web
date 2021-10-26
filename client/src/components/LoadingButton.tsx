import React from 'react'
import { Button, ButtonProps, Spinner } from 'react-bootstrap'

interface LoadingButtonProps extends ButtonProps {
  loading: boolean
}

const LoadingButton = ({
  loading: submitting,
  children,
  disabled,
  ...props
}: LoadingButtonProps) => {
  return (
    <Button {...props} disabled={submitting || disabled}>
      {children}
      <Spinner
        hidden={!submitting}
        style={{ marginLeft: '0.5rem' }}
        as="span"
        animation="border"
        size="sm"
      />
    </Button>
  )
}

export default LoadingButton
