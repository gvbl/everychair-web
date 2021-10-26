import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import * as yup from 'yup'
import { AppDispatch } from '../..'
import LoadingButton from '../../components/LoadingButton'
import GenericModal from '../../components/modals/GenericModal'
import useModalParentPath from '../../hooks/UseModalParentPath'
import { OrganizationParams } from '../../models/OrganizationParams'
import { RootState } from '../../store'
import { addServerErrors } from '../../util/errors'
import { editOrganizationName } from '../app/membershipsSlice'

interface EditOrganizationNameFormData {
  name: string
}

export interface EditOrganizationNameData {
  organizationId: string
  body: EditOrganizationNameFormData
}

const schema = yup.object().shape({
  name: yup.string().required('Organization name is required'),
})

const EditOrganizationNameModal = () => {
  const { organizationId } = useParams<OrganizationParams>()
  const dispatch = useDispatch<AppDispatch>()
  const history = useHistory()
  const modalParentPath = useModalParentPath()

  const [genericError, setGenericError] = useState<string | null>()

  const organizationName = useSelector<RootState, string>(
    (state) => state.memberships.entity[organizationId].organization.name
  )

  const {
    control,
    formState,
    handleSubmit,
    errors,
    setError,
    reset,
  } = useForm<EditOrganizationNameFormData>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset()
    }
  }, [formState.isSubmitSuccessful, reset])

  const submit = async (formData: EditOrganizationNameFormData) => {
    setGenericError(null)
    const resultAction = await dispatch(
      editOrganizationName({
        organizationId: organizationId,
        body: formData,
      })
    )
    if (editOrganizationName.fulfilled.match(resultAction)) {
      history.replace(modalParentPath)
      return
    } else if (editOrganizationName.rejected.match(resultAction)) {
      const serverErrors = resultAction.payload
      if (serverErrors) {
        addServerErrors<EditOrganizationNameFormData>(serverErrors, setError)
        return
      }
      setGenericError('Unable to change organization name')
    }
  }

  return (
    <GenericModal
      title="Edit organization name"
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
        <Form.Group controlId="name">
          <Form.Label>Organization name</Form.Label>
          <Controller
            as={<Form.Control />}
            control={control}
            name="name"
            placeholder="Enter organization name"
            isInvalid={!!errors.name}
            autoComplete="off"
            defaultValue={organizationName}
          />
          <Form.Control.Feedback type="invalid">
            {errors.name?.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Form>
    </GenericModal>
  )
}

export default EditOrganizationNameModal
