import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect, useState } from 'react'
import { Alert, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import * as yup from 'yup'
import { AppDispatch } from '../..'
import LoadingButton from '../../components/LoadingButton'
import GenericModal from '../../components/modals/GenericModal'
import { LocationParams } from '../../models/LocationParams'
import { addServerErrors } from '../../util/errors'
import { addSpace } from './spacesSlice'

interface AddSpaceFormData {
  name: string
}

export interface AddSpaceData {
  organizationId: string
  locationId: string
  formData: AddSpaceFormData
}

const schema = yup.object().shape({
  name: yup.string().required('Space name is required'),
})

const AddSpaceModal = () => {
  const { organizationId, locationId } = useParams<LocationParams>()
  const history = useHistory()
  const {
    control,
    handleSubmit,
    errors,
    setError,
    formState,
    reset,
  } = useForm<AddSpaceFormData>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
  })
  const dispatch = useDispatch<AppDispatch>()
  const [genericError, setGenericError] = useState<string | null>()

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset()
    }
  }, [formState.isSubmitSuccessful, reset])

  if (!organizationId) {
    return null
  }

  const submit = async (formData: AddSpaceFormData) => {
    setGenericError(null)
    const addSpaceData = {
      organizationId: organizationId,
      locationId: locationId,
      formData: formData,
    }
    const resultAction = await dispatch(addSpace(addSpaceData))
    if (addSpace.fulfilled.match(resultAction)) {
      const spaceId = Object.keys(resultAction.payload)[0]
      history.replace(
        `/manage/organizations/${organizationId}/desks/locations/${locationId}/spaces/${spaceId}`
      )
    } else if (addSpace.rejected.match(resultAction)) {
      const serverErrors = resultAction.payload
      if (serverErrors) {
        addServerErrors<AddSpaceFormData>(serverErrors, setError)
        return
      }
      setGenericError('Unable to add space')
    }
  }

  return (
    <GenericModal
      title="Add space"
      footer={
        <LoadingButton
          type="submit"
          loading={formState.isSubmitting}
          onClick={() => handleSubmit(submit)()}
        >
          Add
        </LoadingButton>
      }
      show
      onHide={() => {
        reset()
        setGenericError(null)
      }}
    >
      {genericError && <Alert variant="danger"> {genericError} </Alert>}
      <Form>
        <Form.Label>Space name</Form.Label>
        <Form.Group controlId="name">
          <Controller
            as={<Form.Control />}
            control={control}
            name="name"
            placeholder="Enter name"
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

export default AddSpaceModal
