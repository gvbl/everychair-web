import { yupResolver } from '@hookform/resolvers/yup'
import React, { ChangeEvent, useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Form,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap'
import { CameraFill, FolderFill, Laptop } from 'react-bootstrap-icons'
import { Controller, NestedValue, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import * as yup from 'yup'
import { AppDispatch } from '../..'
import Camera from '../../components/Camera'
import { Shape } from '../../components/HiddenAltImage'
import IconAltImage from '../../components/IconAltImage'
import LoadingButton from '../../components/LoadingButton'
import GenericModal from '../../components/modals/GenericModal'
import useIsCameraPresent from '../../hooks/UseIsCameraPresent'
import useModalParentPath from '../../hooks/UseModalParentPath'
import { SpaceParams } from '../../models/SpaceParams'
import { addServerErrors } from '../../util/errors'
import { isImage, toImageURL } from '../../util/image'
import { toFormData } from '../../util/util'
import { addDesk } from './desksSlice'

interface AddDeskFormData {
  image: FileList | NestedValue<Blob[]>
  name: string
}

export interface AddDeskData {
  organizationId: string
  locationId: string
  spaceId: string
  formData: FormData
}

const schema = yup.object().shape({
  image: yup
    .mixed<FileList>()
    .test('file-size', 'Image size cannot be larger than 3MB', (value) => {
      return value.length === 0 || value[0].size <= 3000000
    })
    .test('file-type', 'This file is not an image', (value) => {
      return value.length === 0 || isImage(value[0])
    }),
  name: yup.string().required('Desk name is required'),
})

enum ImageInputType {
  File = 'FILE',
  Camera = 'CAMERA',
}

const AddDeskModal = () => {
  const { organizationId, locationId, spaceId } = useParams<SpaceParams>()
  const history = useHistory()
  const dispatch = useDispatch<AppDispatch>()
  const modalParentPath = useModalParentPath()
  const isCameraPresent = useIsCameraPresent()

  const {
    control,
    watch,
    setValue,
    trigger,
    handleSubmit,
    errors,
    setError,
    formState,
    getValues,
    reset,
  } = useForm<AddDeskFormData>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
  })

  const [genericError, setGenericError] = useState<string | null>()
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [imageInputType, setImageInputType] = useState(ImageInputType.File)
  const [imageFileName, setImageFileName] = useState('Choose file')

  const image = watch('image', [])

  useEffect(() => {
    if (image instanceof FileList) {
      setImageFileName(image[0].name)
      return
    }
    setImageFileName('Choose file')
  }, [image, setImageFileName])

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset()
    }
  }, [formState.isSubmitSuccessful, reset])

  if (!spaceId) {
    return null
  }

  const handleImageFileChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || event.target.files.length === 0) {
      return
    }
    setValue('image', event.target.files, {
      shouldDirty: true,
    })
    trigger('image')
  }

  const handleImageInputChange = async (value: number) => {
    reset({ ...getValues(), image: [] })
    if (value === 1) {
      setImageInputType(ImageInputType.File)
      setIsCameraActive(false)
    }
    if (value === 2) {
      setImageInputType(ImageInputType.Camera)
      setIsCameraActive(true)
    }
  }

  const handleOnPhotograph = (blob: Blob) => {
    setValue('image', [blob], {
      shouldDirty: true,
    })
    trigger('image')
    setIsCameraActive(false)
  }

  const submit = async (addDeskFormData: AddDeskFormData) => {
    setGenericError(null)
    const addDeskData = {
      organizationId: organizationId,
      locationId: locationId,
      spaceId: spaceId,
      formData: toFormData(addDeskFormData),
    }
    const resultAction = await dispatch(addDesk(addDeskData))
    if (addDesk.fulfilled.match(resultAction)) {
      history.replace(modalParentPath)
    } else if (addDesk.rejected.match(resultAction)) {
      const serverErrors = resultAction.payload
      if (serverErrors) {
        addServerErrors<AddDeskFormData>(serverErrors, setError)
        return
      }
      setGenericError('Unable to add desk')
    }
  }

  return (
    <GenericModal
      title="Add desk"
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
        <Form.Group controlId="name">
          <Form.Label className="required">Desk name</Form.Label>
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
        <div className="d-flex flex-column">
          <div
            className="d-flex flex-column align-items-center"
            style={{ height: '17rem' }}
          >
            <IconAltImage
              title="Desk"
              src={toImageURL(image)}
              hidden={isCameraActive}
              width="9.5rem"
              height="11rem"
              icon={<Laptop color="white" size={96} />}
              shape={Shape.Rounded}
            />
            <Form.Group
              controlId="image"
              hidden={
                isCameraActive || imageInputType === ImageInputType.Camera
              }
              style={{ alignSelf: 'stretch' }}
            >
              <Form.Label>Desk image</Form.Label>
              <Controller
                render={({ name }) => (
                  <Form.File custom>
                    <Form.File.Input
                      onChange={handleImageFileChange}
                      name={name}
                      isInvalid={!!errors.image}
                      accept="image/*"
                    />
                    <Form.File.Label>{imageFileName}</Form.File.Label>
                    <Form.Control.Feedback type="invalid">
                      {errors.image?.message}
                    </Form.Control.Feedback>
                  </Form.File>
                )}
                control={control}
                name="image"
                defaultValue={[]}
              />
            </Form.Group>
            {isCameraActive && <Camera onPhotograph={handleOnPhotograph} />}
            <Button
              variant="secondary"
              hidden={isCameraActive || imageInputType === ImageInputType.File}
              onClick={() => {
                reset({ ...getValues(), image: [] })
                setImageInputType(ImageInputType.Camera)
                setIsCameraActive(true)
              }}
              style={{ marginTop: '2rem' }}
            >
              Retake
            </Button>
          </div>
          <ToggleButtonGroup
            type="radio"
            name="image-input"
            defaultValue={1}
            onChange={handleImageInputChange}
            style={{ alignSelf: 'center' }}
            hidden={!isCameraPresent}
          >
            <ToggleButton
              value={1}
              checked={imageInputType === ImageInputType.File}
              type="radio"
              variant="outline-secondary"
            >
              <FolderFill /> File
            </ToggleButton>
            <ToggleButton
              value={2}
              checked={imageInputType === ImageInputType.Camera}
              type="radio"
              variant="outline-secondary"
            >
              <CameraFill /> Camera
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      </Form>
    </GenericModal>
  )
}

export default AddDeskModal
