import { yupResolver } from '@hookform/resolvers/yup'
import bsCustomFileInput from 'bs-custom-file-input'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { Building } from 'react-bootstrap-icons'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import * as yup from 'yup'
import { AppDispatch } from '../..'
import { Shape } from '../../components/HiddenAltImage'
import IconAltImage from '../../components/IconAltImage'
import LoadingButton from '../../components/LoadingButton'
import GenericModal from '../../components/modals/GenericModal'
import useModalParentPath from '../../hooks/UseModalParentPath'
import { LocationParams } from '../../models/LocationParams'
import { RootState } from '../../store'
import { isImage, toImageURL } from '../../util/image'
import { toFormData } from '../../util/util'
import { editLocationImage } from './locationsSlice'

export interface EditLocationImageData {
  locationId: string
  body: FormData
}

interface EditLocationImageFormData {
  image: FileList
}

const schema = yup.object().shape({
  image: yup
    .mixed<FileList>()
    .test('file-required', 'Image is required', (value) => {
      return value.length > 0
    })
    .test('file-size', 'Image size cannot be larger than 3MB', (value) => {
      return value.length === 0 || value[0].size <= 3000000
    })
    .test('file-type', 'This file is not an image', (value) => {
      return value.length === 0 || isImage(value[0])
    }),
})

const EditLocationImageModal = () => {
  const { locationId } = useParams<LocationParams>()
  const dispatch = useDispatch<AppDispatch>()
  const history = useHistory()
  const modalParentPath = useModalParentPath()

  const imageUrl = useSelector<RootState, string | undefined>(
    (state) => state.locations.entity[locationId]?.imageUrl
  )

  const {
    control,
    watch,
    setValue,
    formState,
    handleSubmit,
    errors,
    reset,
  } = useForm<EditLocationImageFormData>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
  })

  const [genericError, setGenericError] = useState<string | null>()

  const image = watch('image')

  useEffect(() => {
    bsCustomFileInput.init()
  })

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset()
    }
  }, [formState.isSubmitSuccessful, reset])

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return undefined
    }
    setValue('image', event.target.files, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const submit = async (formData: EditLocationImageFormData) => {
    setGenericError(null)
    const resultAction = await dispatch(
      editLocationImage({
        locationId: locationId,
        body: toFormData(formData),
      })
    )
    if (editLocationImage.fulfilled.match(resultAction)) {
      history.replace(modalParentPath)
      return
    }
    setGenericError('Unable to change image')
  }

  return (
    <GenericModal
      title="Edit location image"
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
        <div
          className="d-flex justify-content-center"
          style={{ marginBottom: '1rem' }}
        >
          {image ? (
            <IconAltImage
              title="Image"
              src={toImageURL(image)}
              width="6rem"
              height="6rem"
              icon={<Building color="white" size={64} />}
              shape={Shape.Rounded}
            />
          ) : (
            <IconAltImage
              title="Image"
              src={imageUrl}
              width="6rem"
              height="6rem"
              icon={<Building color="white" size={64} />}
              shape={Shape.Rounded}
            />
          )}
        </div>
        <Form.Group controlId="image">
          <Form.Label>Image</Form.Label>
          <Controller
            as={
              <Form.File custom>
                <Form.File.Input
                  name="image"
                  onChange={handleChange}
                  isInvalid={!!errors.image}
                  accept="image/*"
                />
                <Form.File.Label data-browse="Browse">
                  Choose file
                </Form.File.Label>
                <Form.Control.Feedback type="invalid">
                  {errors.image?.message}
                </Form.Control.Feedback>
              </Form.File>
            }
            control={control}
            name="image"
            defaultValue={[]}
          />
        </Form.Group>
      </Form>
    </GenericModal>
  )
}

export default EditLocationImageModal
