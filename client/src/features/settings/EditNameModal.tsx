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
import { Role } from '../../models/api/Role'
import { RootState } from '../../store'
import { addServerErrors } from '../../util/errors'
import { editName } from '../app/userSlice'
import { syncSelfMemberName } from '../members/membersSlice'

interface EditNameFormData {
  firstName?: string
  lastName?: string
}

export interface EditNameData {
  userId: string
  body: EditNameFormData
}

export interface SyncSelfMemberNameData {
  membershipId: string
  firstName?: string
  lastName?: string
}

interface EditNameSelected {
  userId?: string
  firstName?: string
  lastName?: string
  isAdmin: boolean
  selfMembershipIds: string[]
}

const schema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
})

const EditNameModal = () => {
  const dispatch = useDispatch<AppDispatch>()
  const history = useHistory()
  const modalParentPath = useModalParentPath()

  const [genericError, setGenericError] = useState<string | null>()

  const {
    userId,
    firstName,
    lastName,
    isAdmin,
    selfMembershipIds,
  } = useSelector<RootState, EditNameSelected>((state) => {
    const userId = state.user.entity?.id
    return {
      userId: userId,
      firstName: state.user.entity?.firstName,
      lastName: state.user.entity?.lastName,
      isAdmin:
        Object.values(state.memberships.entity).filter((membership) =>
          membership.roles.includes(Role.ADMIN)
        ).length > 0,
      selfMembershipIds: Object.values(state.members.entity)
        .filter((member) => member.userId === userId)
        .map((member) => member.membershipId),
    }
  })

  const {
    control,
    formState,
    handleSubmit,
    errors,
    setError,
    reset,
  } = useForm<EditNameFormData>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset()
    }
  }, [formState.isSubmitSuccessful, reset])

  if (!userId) {
    return null
  }

  const submit = async (formData: EditNameFormData) => {
    setGenericError(null)
    const resultAction = await dispatch(
      editName({
        userId: userId,
        body: formData,
      })
    )
    if (editName.fulfilled.match(resultAction)) {
      if (isAdmin) {
        for (let i = 0; i < selfMembershipIds.length; i++) {
          await dispatch(
            syncSelfMemberName({
              membershipId: selfMembershipIds[i],
              ...formData,
            })
          )
        }
      }
      history.replace(modalParentPath)
      return
    } else if (editName.rejected.match(resultAction)) {
      const serverErrors = resultAction.payload
      if (serverErrors) {
        addServerErrors<EditNameFormData>(serverErrors, setError)
        return
      }
      setGenericError('Unable to change name')
    }
  }

  return (
    <GenericModal
      title="Edit name"
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
        <Form.Group controlId="firstName">
          <Form.Label>First name</Form.Label>
          <Controller
            as={<Form.Control />}
            control={control}
            name="firstName"
            placeholder="Enter first name"
            autoComplete="off"
            isInvalid={!!errors.firstName}
            defaultValue={firstName ?? ''}
          />
          <Form.Control.Feedback type="invalid">
            {errors.firstName?.message}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="lastName">
          <Form.Label>Last name</Form.Label>
          <Controller
            as={<Form.Control />}
            control={control}
            name="lastName"
            placeholder="Enter last name"
            autoComplete="off"
            isInvalid={!!errors.lastName}
            defaultValue={lastName ?? ''}
          />
          <Form.Control.Feedback type="invalid">
            {errors.lastName?.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Form>
    </GenericModal>
  )
}

export default EditNameModal
