import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import * as yup from 'yup'
import { AppDispatch } from '../..'
import LoadingButton from '../../components/LoadingButton'
import GenericModal from '../../components/modals/GenericModal'
import useModalParentPath from '../../hooks/UseModalParentPath'
import { RootState } from '../../store'
import { addServerErrors } from '../../util/errors'
import { changePassword } from '../app/userSlice'

interface ChangePasswordFormData {
  currentPassword: string
  newPassword: string
}

export interface ChangePasswordData {
  userId: string
  body: ChangePasswordFormData
}

const schema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'New password must be at least 8 characters long'),
})

const ChangePasswordModal = () => {
  const history = useHistory()
  const modalParentPath = useModalParentPath()

  const [genericError, setGenericError] = useState<string | null>()

  const userId = useSelector<RootState, string | undefined>(
    (state) => state.user.entity?.id
  )

  const {
    control,
    formState,
    handleSubmit,
    errors,
    setError,
    reset,
  } = useForm<ChangePasswordFormData>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
  })

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset()
    }
  }, [formState.isSubmitSuccessful, reset])

  if (!userId) {
    return null
  }

  const submit = async (formData: ChangePasswordFormData) => {
    setGenericError(null)
    const resultAction = await dispatch(
      changePassword({
        userId: userId,
        body: formData,
      })
    )
    if (changePassword.fulfilled.match(resultAction)) {
      history.replace(modalParentPath)
      return
    } else if (changePassword.rejected.match(resultAction)) {
      const serverErrors = resultAction.payload
      if (serverErrors) {
        addServerErrors<ChangePasswordFormData>(serverErrors, setError)
        return
      }
      setGenericError('Unable to change password')
    }
  }

  return (
    <GenericModal
      title="Change password"
      footer={
        <>
          <LoadingButton
            type="submit"
            loading={formState.isSubmitting}
            onClick={() => handleSubmit(submit)()}
          >
            Save
          </LoadingButton>
          <Button
            variant="secondary"
            onClick={() => history.replace(modalParentPath)}
          >
            Close
          </Button>
        </>
      }
      show
      onHide={() => {
        reset()
        setGenericError(null)
      }}
    >
      {genericError && <Alert variant="danger"> {genericError} </Alert>}
      <Form>
        <Form.Group controlId="currentPassword">
          <Form.Label>Current Password</Form.Label>
          <Controller
            as={<Form.Control />}
            control={control}
            name="currentPassword"
            type="password"
            placeholder="Enter current password"
            isInvalid={!!errors.currentPassword}
            defaultValue=""
          />
          <Form.Control.Feedback type="invalid">
            {errors.currentPassword?.message}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="newPassword">
          <Form.Label>New password</Form.Label>
          <Controller
            as={<Form.Control />}
            control={control}
            name="newPassword"
            type="password"
            placeholder="Enter new password"
            isInvalid={!!errors.newPassword}
            defaultValue=""
          />
          <Form.Text id="passwordHelpBlock" muted>
            Your password must be 8 characters long.
          </Form.Text>
          <Form.Control.Feedback type="invalid">
            {errors.newPassword?.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Form>
    </GenericModal>
  )
}

export default ChangePasswordModal
