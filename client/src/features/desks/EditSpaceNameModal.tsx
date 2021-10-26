import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import LoadingButton from '../../components/LoadingButton'
import GenericModal from '../../components/modals/GenericModal'
import useModalParentPath from '../../hooks/UseModalParentPath'
import { SpaceParams } from '../../models/SpaceParams'
import { RootState } from '../../store'
import { editSpaceName } from './spacesSlice'
import * as yup from 'yup'
import { addServerErrors } from '../../util/errors'
import LoadingModal from '../../components/LoadingModal'
import { Loading, isLoading } from '../../models/Loading'

interface EditSpaceNameFormData {
  name: string
}

export interface EditSpaceNameData {
  spaceId: string
  body: EditSpaceNameFormData
}

const schema = yup.object().shape({
  name: yup.string().required('Space name is required'),
})

interface EditSpaceNameModalSelected {
  spaceName?: string
  spacesLoading: Loading
}

const EditSpaceNameModal = () => {
  const { spaceId } = useParams<SpaceParams>()
  const dispatch = useDispatch<AppDispatch>()
  const history = useHistory()
  const modalParentPath = useModalParentPath()

  const [genericError, setGenericError] = useState<string | null>()

  const { spaceName, spacesLoading } = useSelector<
    RootState,
    EditSpaceNameModalSelected
  >((state) => {
    return {
      spaceName: state.spaces.entity[spaceId]?.name,
      spacesLoading: state.spaces.loading,
    }
  })

  const {
    control,
    formState,
    handleSubmit,
    errors,
    setError,
    reset,
  } = useForm<EditSpaceNameFormData>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset()
    }
  }, [formState.isSubmitSuccessful, reset])

  const submit = async (formData: EditSpaceNameFormData) => {
    setGenericError(null)
    const resultAction = await dispatch(
      editSpaceName({
        spaceId: spaceId,
        body: formData,
      })
    )
    if (editSpaceName.fulfilled.match(resultAction)) {
      history.replace(modalParentPath)
      return
    } else if (editSpaceName.rejected.match(resultAction)) {
      const serverErrors = resultAction.payload
      if (serverErrors) {
        addServerErrors<EditSpaceNameFormData>(serverErrors, setError)
        return
      }
      setGenericError('Unable to change space name')
    }
  }

  if (isLoading(spacesLoading)) {
    return <LoadingModal title="Edit space name" />
  }
  if (spacesLoading === Loading.FAILED) {
    return <LoadingModal title="Edit space name" error />
  }

  return (
    <GenericModal
      title="Edit space name"
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
          <Form.Label>Space name</Form.Label>
          <Controller
            as={<Form.Control />}
            control={control}
            name="name"
            placeholder="Enter space name"
            isInvalid={!!errors.name}
            autoComplete="off"
            defaultValue={spaceName}
          />
          <Form.Control.Feedback type="invalid">
            {errors.name?.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Form>
    </GenericModal>
  )
}

export default EditSpaceNameModal
