import { yupResolver } from '@hookform/resolvers/yup'
import axios, { AxiosError } from 'axios'
import React, { useState } from 'react'
import { Alert, Card, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'
import Center from '../../components/Center'
import LoadingButton from '../../components/LoadingButton'
import { addServerErrors, ErrorResponse } from '../../util/errors'

export interface ResetPasswordFormData {
  email: string
}

const schema = yup.object().shape({
  email: yup.string().required('Email is required').email('Email is not valid'),
})

const ResetPasswordPage = () => {
  const {
    control,
    handleSubmit,
    errors,
    setError,
    formState,
  } = useForm<ResetPasswordFormData>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
  })
  const [genericError, setGenericError] = useState<string | null>()
  const [sentResetEmail, setSentResetEmail] = useState<boolean>()

  const submit = async (resetPasswordData: ResetPasswordFormData) => {
    try {
      await axios.post('/api/reset-password', resetPasswordData)
      setSentResetEmail(true)
    } catch (err: any) {
      const error: AxiosError<ErrorResponse> = err
      const serverErrors = error.response?.data.errors
      if (serverErrors) {
        addServerErrors<ResetPasswordFormData>(serverErrors, setError)
        return
      }
      setGenericError('Unable to reset password')
    }
  }

  return (
    <Center>
      {sentResetEmail ? (
        <Card>
          <Card.Body>
            <Card.Title>Reset password</Card.Title>
            <Card.Text>
              Check your email for a link to reset your password.
            </Card.Text>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body>
            <Card.Title>Reset password</Card.Title>
            <Card.Text>
              Enter your email to receive a reset password link.
            </Card.Text>
            {genericError && <Alert variant="danger"> {genericError} </Alert>}
            <Form onSubmit={handleSubmit(submit)}>
              <Form.Group controlId="email">
                <Form.Label>Email</Form.Label>
                <Controller
                  as={<Form.Control />}
                  control={control}
                  name="email"
                  placeholder="Enter email"
                  autoComplete="off"
                  isInvalid={!!errors.email}
                  defaultValue=""
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email?.message}
                </Form.Control.Feedback>
              </Form.Group>
              <LoadingButton
                type="submit"
                loading={formState.isSubmitting}
                style={{ float: 'right' }}
              >
                Submit
              </LoadingButton>
            </Form>
          </Card.Body>
        </Card>
      )}
    </Center>
  )
}

export default ResetPasswordPage
