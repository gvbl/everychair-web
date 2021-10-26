import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import * as yup from 'yup'
import { AppDispatch } from '../..'
import LoadingButton from '../../components/LoadingButton'
import LoadingModal from '../../components/LoadingModal'
import GenericModal from '../../components/modals/GenericModal'
import useModalParentPath from '../../hooks/UseModalParentPath'
import { Loading, isLoading } from '../../models/Loading'
import { LocationParams } from '../../models/LocationParams'
import { RootState } from '../../store'
import { addServerErrors } from '../../util/errors'
import { editLocationName } from './locationsSlice'

interface EditLocationNameFormData {
  name: string
}

export interface EditLocationNameData {
  locationId: string
  body: EditLocationNameFormData
}

const schema = yup.object().shape({
  name: yup.string().required('Location name is required'),
})

interface EditLocationNameModalSelected {
  locationName?: string
  locationsLoading: Loading
}

const EditLocationNameModal = () => {
  const { locationId } = useParams<LocationParams>()
  const dispatch = useDispatch<AppDispatch>()
  const history = useHistory()
  const modalParentPath = useModalParentPath()

  const [genericError, setGenericError] = useState<string | null>()

  const { locationName, locationsLoading } = useSelector<
    RootState,
    EditLocationNameModalSelected
  >((state) => {
    return {
      locationName: state.locations.entity[locationId]?.name,
      locationsLoading: state.locations.loading,
    }
  })

  const {
    control,
    formState,
    handleSubmit,
    errors,
    setError,
    reset,
  } = useForm<EditLocationNameFormData>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset()
    }
  }, [formState.isSubmitSuccessful, reset])

  const submit = async (formData: EditLocationNameFormData) => {
    setGenericError(null)
    const resultAction = await dispatch(
      editLocationName({
        locationId: locationId,
        body: formData,
      })
    )
    if (editLocationName.fulfilled.match(resultAction)) {
      history.replace(modalParentPath)
      return
    } else if (editLocationName.rejected.match(resultAction)) {
      const serverErrors = resultAction.payload
      if (serverErrors) {
        addServerErrors<EditLocationNameFormData>(serverErrors, setError)
        return
      }
      setGenericError('Unable to change location name')
    }
  }

  if (isLoading(locationsLoading)) {
    return <LoadingModal title="Edit location name" />
  }
  if (locationsLoading === Loading.FAILED) {
    return <LoadingModal title="Edit location name" error />
  }

  return (
    <GenericModal
      title="Edit location name"
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
          <Form.Label>Location name</Form.Label>
          <Controller
            as={<Form.Control />}
            control={control}
            name="name"
            placeholder="Enter location name"
            isInvalid={!!errors.name}
            autoComplete="off"
            defaultValue={locationName}
          />
          <Form.Control.Feedback type="invalid">
            {errors.name?.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Form>
    </GenericModal>
  )
}

export default EditLocationNameModal
