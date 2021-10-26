import { yupResolver } from '@hookform/resolvers/yup'
import axios, { AxiosError } from 'axios'
import React, { useState } from 'react'
import { Alert, Button, Card, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import * as yup from 'yup'
import Center from '../../components/Center'
import LoadingButton from '../../components/LoadingButton'
import {
  addServerErrors,
  ErrorResponse,
  hasFormFeedback,
} from '../../util/errors'
import { ResetParams } from './ResetParams'

export interface ChangePasswordFormData {
  password: string
  confirmPassword: string
}

const schema = yup.object().shape({
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters long'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), undefined], 'Passwords must match'),
})

const ChangePasswordPage = () => {
  const { token } = useParams<ResetParams>()
  const {
    control,
    handleSubmit,
    errors,
    setError,
    formState,
  } = useForm<ChangePasswordFormData>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
  })
  const [genericError, setGenericError] = useState<string | null>()
  const [changeSuccess, setChangeSuccess] = useState<boolean>()

  const submit = async (formData: ChangePasswordFormData) => {
    try {
      await axios.post(`/api/change-password/${token}`, formData)
      setChangeSuccess(true)
    } catch (err: any) {
      const error: AxiosError<ErrorResponse> = err
      const serverErrors = error.response?.data.errors
      if (serverErrors) {
        if (hasFormFeedback(serverErrors, formData)) {
          addServerErrors<ChangePasswordFormData>(serverErrors, setError)
        } else {
          setGenericError(serverErrors[0].msg)
        }
        return
      }
      setGenericError('Unable to change password')
    }
  }

  return (
    <Center>
      {changeSuccess ? (
        <Card>
          <Card.Body>
            <Card.Title>Success</Card.Title>
            <Card.Text>Your password has been changed.</Card.Text>
            <Link to="/login">
              <Button style={{ float: 'right' }}>Log in</Button>
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body>
            <Card.Title>Change password</Card.Title>
            {genericError && <Alert variant="danger"> {genericError} </Alert>}
            <Form onSubmit={handleSubmit(submit)}>
              <Form.Group controlId="password">
                <Form.Label>Password</Form.Label>
                <Controller
                  as={<Form.Control />}
                  control={control}
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  isInvalid={!!errors.password}
                  defaultValue=""
                />
                <Form.Text id="passwordHelpBlock" muted>
                  Your password must be 8 characters long.
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  {errors.password?.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="confirmPassword">
                <Form.Label>Confirm password</Form.Label>
                <Controller
                  as={<Form.Control />}
                  control={control}
                  name="confirmPassword"
                  type="password"
                  placeholder="Enter confirm password"
                  isInvalid={!!errors.confirmPassword}
                  defaultValue=""
                />
                <Form.Control.Feedback type="invalid">
                  {errors.confirmPassword?.message}
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

export default ChangePasswordPage
