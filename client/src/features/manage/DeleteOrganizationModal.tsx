import { yupResolver } from '@hookform/resolvers/yup'
import React, { useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import * as yup from 'yup'
import { AppDispatch } from '../..'
import LoadingButton from '../../components/LoadingButton'
import GenericModal from '../../components/modals/GenericModal'
import useModalParentPath from '../../hooks/UseModalParentPath'
import Organization from '../../models/api/Organization'
import { OrganizationParams } from '../../models/OrganizationParams'
import { RootState } from '../../store'
import { deleteOrganization } from '../app/membershipsSlice'

export interface DeleteOrganizationFormData {
  name: string
}

interface DeleteOrganizationModalSelected {
  organization: Organization | undefined
  otherOrganizationIds: string[]
}

const DeleteOrganizationModal = () => {
  const { organizationId } = useParams<OrganizationParams>()
  const dispatch = useDispatch<AppDispatch>()
  const history = useHistory()
  const modalParentPath = useModalParentPath()

  const { organization, otherOrganizationIds } = useSelector<
    RootState,
    DeleteOrganizationModalSelected
  >((state) => {
    const membership = state.memberships.entity[organizationId]
    return {
      organization: membership ? membership.organization : undefined,
      otherOrganizationIds: Object.keys(state.memberships.entity).filter(
        (key) => key !== organizationId
      ),
    }
  })

  const schema = yup.object().shape({
    name: yup
      .string()
      .required('Organization name is required')
      .test('confirm-name', 'Name does not match', (value) => {
        return value === organization?.name
      }),
  })

  const {
    control,
    handleSubmit,
    errors,
    formState,
    reset,
  } = useForm<DeleteOrganizationFormData>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
  })

  const [genericError, setGenericError] = useState<string | null>()

  if (!organization) {
    return null
  }

  const submit = async () => {
    setGenericError(null)
    const resultAction = await dispatch(deleteOrganization(organization.id))
    if (deleteOrganization.fulfilled.match(resultAction)) {
      if (otherOrganizationIds.length === 0) {
        history.replace('/start')
      } else {
        history.replace(
          `/manage/organizations/${otherOrganizationIds[0]}/members`
        )
      }
      return
    }
    setGenericError('Unable to delete organization')
  }

  return (
    <GenericModal
      title="Delete organization"
      footer={
        <>
          <LoadingButton
            type="submit"
            loading={formState.isSubmitting}
            onClick={() => handleSubmit(submit)()}
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
      onHide={() => {
        reset()
        setGenericError(null)
      }}
    >
      {genericError && <Alert variant="danger"> {genericError} </Alert>}
      <p>
        Are you sure you want to delete <b>{organization.name}</b>? This action
        cannot be undone. All locations, spaces, and desks in this organization
        will also be deleted. Reservations of these desks will be canceled. All
        members will be removed from this organization and open invitations will
        be canceled.
      </p>
      <p>Type the organization name below to confirm delete.</p>
      <Form>
        <Form.Group controlId="name">
          <Form.Label>Organization name</Form.Label>
          <Controller
            as={<Form.Control />}
            control={control}
            name="name"
            placeholder="Enter organization name"
            autoComplete="off"
            isInvalid={!!errors.name}
            defaultValue=""
          />
          <Form.Control.Feedback type="invalid">
            {errors.name?.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Form>
    </GenericModal>
  )
}

export default DeleteOrganizationModal
