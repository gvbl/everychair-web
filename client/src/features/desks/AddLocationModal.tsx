import { yupResolver } from '@hookform/resolvers/yup'
import bsCustomFileInput from 'bs-custom-file-input'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { Alert, Form } from 'react-bootstrap'
import { Building } from 'react-bootstrap-icons'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import * as yup from 'yup'
import { AppDispatch } from '../..'
import { Shape } from '../../components/HiddenAltImage'
import IconAltImage from '../../components/IconAltImage'
import LoadingButton from '../../components/LoadingButton'
import GenericModal from '../../components/modals/GenericModal'
import { OrganizationParams } from '../../models/OrganizationParams'
import { addServerErrors } from '../../util/errors'
import { isImage, toImageURL } from '../../util/image'
import { ZipCodeRegEx } from '../../util/regex'
import { StatesAbbrs } from '../../util/states'
import { toFormData } from '../../util/util'
import AddressFormFields from './AddressFormFields'
import { addLocation } from './locationsSlice'

interface AddLocationFormData {
  name: string
  image: FileList
  street: string
  city?: string
  state?: string
  zip?: string
}

export interface AddLocationData {
  organizationId: string
  formData: FormData
}

const schema = yup.object().shape({
  name: yup.string().required('Location name is required'),
  image: yup
    .mixed<FileList>()
    .test('file-size', 'Image size cannot be larger than 3MB', (value) => {
      return value.length === 0 || value[0].size <= 3000000
    })
    .test('file-type', 'This file is not an image', (value) => {
      return value.length === 0 || isImage(value[0])
    }),
  street: yup
    .string()
    .test('complete-address', 'Address is incomplete', function (value) {
      const city = this.resolve(yup.ref('city'))
      const state = this.resolve(yup.ref('state'))
      const zip = this.resolve(yup.ref('zip'))
      return !((city || state || zip) && !value)
    }),
  state: yup.string().test('valid-state', 'Invalid state', (value) => {
    return !value || StatesAbbrs.includes(value as string)
  }),
  zip: yup.string().test('valid-zip', 'Invalid zip', (value) => {
    return !value || !!ZipCodeRegEx.exec(value)
  }),
})

const AddLocationModal = () => {
  const { organizationId } = useParams<OrganizationParams>()
  const history = useHistory()
  const {
    control,
    watch,
    setValue,
    handleSubmit,
    errors,
    setError,
    formState,
    reset,
  } = useForm<AddLocationFormData>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
  })
  const dispatch = useDispatch<AppDispatch>()
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

  if (!organizationId) {
    return null
  }

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return undefined
    }
    setValue('image', event.target.files, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const submit = async (formData: AddLocationFormData) => {
    setGenericError(null)
    const addLocationData = {
      organizationId: organizationId,
      formData: toFormData({
        ...formData,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    }
    const resultAction = await dispatch(addLocation(addLocationData))
    if (addLocation.fulfilled.match(resultAction)) {
      const locationId = Object.keys(resultAction.payload)[0]
      history.replace(
        `/manage/organizations/${organizationId}/desks/locations/${locationId}`
      )
    } else if (addLocation.rejected.match(resultAction)) {
      const serverErrors = resultAction.payload
      if (serverErrors) {
        addServerErrors<AddLocationFormData>(serverErrors, setError)
        return
      }
      setGenericError('Unable to add location')
    }
  }

  return (
    <GenericModal
      title="Add location"
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
        <Form.Label className="required">Location name</Form.Label>
        <Form.Group controlId="name">
          <Controller
            as={<Form.Control />}
            control={control}
            name="name"
            placeholder="Enter name"
            autoComplete="_"
            isInvalid={!!errors.name}
            defaultValue=""
          />
          <Form.Control.Feedback type="invalid">
            {errors.name?.message}
          </Form.Control.Feedback>
        </Form.Group>
        <div
          className="d-flex justify-content-center"
          style={{ marginBottom: '1rem' }}
        >
          <IconAltImage
            title="Image"
            src={image ? toImageURL(image) : undefined}
            width="6rem"
            height="6rem"
            icon={<Building color="white" size={64} />}
            shape={Shape.Rounded}
          />
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
        <AddressFormFields control={control} errors={errors} />
      </Form>
    </GenericModal>
  )
}

export default AddLocationModal
