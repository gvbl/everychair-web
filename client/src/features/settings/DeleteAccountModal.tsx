import { yupResolver } from '@hookform/resolvers/yup'
import _ from 'lodash'
import React, { useState } from 'react'
import { Alert, Button, Form, ListGroup } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import * as yup from 'yup'
import { AppDispatch } from '../..'
import LoadingButton from '../../components/LoadingButton'
import GenericModal from '../../components/modals/GenericModal'
import useModalParentPath from '../../hooks/UseModalParentPath'
import Organization from '../../models/api/Organization'
import { Role } from '../../models/api/Role'
import { AuthStrategy } from '../../models/api/User'
import { RootState } from '../../store'
import { addServerErrors } from '../../util/errors'
import { useQuery } from '../../util/query'
import { buildQuery } from '../../util/util'
import { deleteAccount } from '../app/userSlice'

interface DeleteAccountFormData {
  email: string
  phrase: string
  password?: string
}

export interface DeleteAccountData {
  userId: string
  body: DeleteAccountFormData
}

interface DeleteAccountModalSelected {
  authStrategy?: AuthStrategy
  userId?: string
  userEmail?: string
  nonOwnerMembershipsCount: number
  ownerOrganizations: Organization[]
}

const ErrorMsgMap: Record<string, string> = {
  wrongAccount: 'Your identity could not be verified with Google.',
  emailRequired: 'Email was missing.',
  emailIncorrect: 'Email was incorrect.',
  phraseRequired: 'Phrase was missing.',
  phraseIncorrect: 'Phrase was incorrect.',
}

const deleteGenericError = (error: string | null): string | null => {
  if (!error) {
    return null
  }
  if (ErrorMsgMap[error]) {
    return ErrorMsgMap[error]
  }
  return 'Unable to delete account'
}

const DeleteAccountModal = () => {
  const error = useQuery().get('error')
  const dispatch = useDispatch<AppDispatch>()
  const history = useHistory()
  const modalParentPath = useModalParentPath()

  const {
    authStrategy,
    userId,
    userEmail,
    nonOwnerMembershipsCount,
    ownerOrganizations,
  } = useSelector<RootState, DeleteAccountModalSelected>((state) => {
    const memberships = Object.values(state.memberships.entity)
    return {
      authStrategy: state.user.entity?.authStrategy,
      userId: state.user.entity?.id,
      userEmail: state.user.entity?.email,
      nonOwnerMembershipsCount: memberships.filter(
        (membership) => !membership.roles.includes(Role.OWNER)
      ).length,
      ownerOrganizations: memberships
        .filter((membership) => membership.roles.includes(Role.OWNER))
        .map((membership) => membership.organization),
    }
  })

  const schema = yup.object().shape({
    email: yup
      .string()
      .required('Email is required')
      .test(
        'email-match',
        'Email is not correct',
        (value) => value === userEmail
      ),
    phrase: yup
      .string()
      .required('Verification phrase is required')
      .test(
        'phrase-match',
        'Phrase is not correct',
        (value) => value === 'delete my account'
      ),
    password: yup
      .string()
      .test(
        'password-required-local',
        'Password is required',
        (value) => authStrategy !== AuthStrategy.LOCAL || !!value
      ),
  })

  const {
    control,
    handleSubmit,
    errors,
    setError,
    formState,
    trigger,
    reset,
    watch,
  } = useForm<DeleteAccountFormData>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
  })

  const [genericError, setGenericError] = useState<string | null>(
    deleteGenericError(error)
  )

  const email = watch('email', undefined)
  const phrase = watch('phrase', undefined)

  if (!userId || !userEmail || !authStrategy) {
    return null
  }

  const submit = async (formData: DeleteAccountFormData) => {
    setGenericError(null)
    const resultAction = await dispatch(
      deleteAccount({
        userId: userId,
        body: formData,
      })
    )
    if (deleteAccount.fulfilled.match(resultAction)) {
      window.location.href = '/api/logout'
      return
    } else if (deleteAccount.rejected.match(resultAction)) {
      const serverErrors = resultAction.payload
      if (serverErrors) {
        addServerErrors<DeleteAccountFormData>(serverErrors, setError)
        return
      }
      setGenericError('Unable to delete account')
    }
  }

  return (
    <GenericModal
      title="Delete account"
      footer={
        <>
          <LoadingButton
            type="submit"
            variant="danger"
            loading={formState.isSubmitting}
            onClick={async () => {
              if (authStrategy === AuthStrategy.LOCAL) {
                handleSubmit(submit)()
              } else if (authStrategy === AuthStrategy.GOOGLE) {
                await trigger()
                if (!_.isEmpty(errors)) {
                  return
                }
                const query = buildQuery({
                  userId: userId,
                  email: email,
                  phrase: phrase,
                })
                window.location.replace(`/api/delete-account/google?${query}`)
              }
            }}
          >
            Delete
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
      scrollable={true}
      onHide={() => {
        reset()
        setGenericError(null)
      }}
    >
      {genericError && <Alert variant="danger"> {genericError} </Alert>}
      <p>
        Are you sure you want to delete your account? This action cannot be
        undone.
      </p>
      <p hidden={nonOwnerMembershipsCount === 0}>
        Your membership to {nonOwnerMembershipsCount} organization
        {nonOwnerMembershipsCount > 1 && 's'} will be canceled. All upcoming
        reservations at these organizations will also be canceled.
      </p>
      <div hidden={ownerOrganizations.length === 0}>
        <p>
          You are the owner of the following organization
          {ownerOrganizations.length > 1 && 's'}:
        </p>
        <ListGroup style={{ marginBottom: '1rem' }}>
          {ownerOrganizations.map((ownerOrganization) => {
            return (
              <ListGroup.Item key={ownerOrganization.id}>
                {ownerOrganization.name}
              </ListGroup.Item>
            )
          })}
        </ListGroup>
        <p>
          {ownerOrganizations.length > 1 ? 'These' : 'This'} organization{' '}
          {ownerOrganizations.length > 1 && 's'} will be deleted. If you have a
          paid plan, your most recent payment will be the last. All locations,
          spaces, and desks in {ownerOrganizations.length > 1 ? 'each' : 'this'}{' '}
          organization will also be deleted. Reservations of these desks will be
          canceled. All members will be removed from{' '}
          {ownerOrganizations.length > 1 ? 'each' : 'this'} organization and
          open invitations will be canceled.
        </p>
      </div>
      <Form>
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
          <Form.Control.Feedback
            style={{ whiteSpace: 'pre-wrap' }}
            type="invalid"
          >
            {errors.email?.message}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="phrase">
          <Form.Label>
            Type <i>delete my account</i> below
          </Form.Label>
          <Controller
            as={<Form.Control />}
            control={control}
            name="phrase"
            placeholder="Enter verification phrase"
            autoComplete="off"
            isInvalid={!!errors.phrase}
            defaultValue=""
          />
          <Form.Control.Feedback
            style={{ whiteSpace: 'pre-wrap' }}
            type="invalid"
          >
            {errors.phrase?.message}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group
          controlId="password"
          hidden={authStrategy !== AuthStrategy.LOCAL}
        >
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
          <Form.Control.Feedback
            style={{ whiteSpace: 'pre-wrap' }}
            type="invalid"
          >
            {errors.password?.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Form>
      <p hidden={authStrategy !== AuthStrategy.GOOGLE}>
        Your identity will be verified with Google before delete.
      </p>
    </GenericModal>
  )
}

export default DeleteAccountModal
