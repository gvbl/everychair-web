import { yupResolver } from '@hookform/resolvers/yup'
import bsCustomFileInput from 'bs-custom-file-input'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import * as yup from 'yup'
import { AppDispatch } from '../..'
import HiddenAltImage from '../../components/HiddenAltImage'
import LoadingButton from '../../components/LoadingButton'
import GenericModal from '../../components/modals/GenericModal'
import useModalParentPath from '../../hooks/UseModalParentPath'
import { OrganizationParams } from '../../models/OrganizationParams'
import { RootState } from '../../store'
import { isImage, toImageURL } from '../../util/image'
import { toFormData } from '../../util/util'
import { editOrganizationIcon } from '../app/membershipsSlice'

export interface EditOrganizationIconData {
  organizationId: string
  body: FormData
}

interface EditOrganizationIconFormData {
  icon: FileList
}

const schema = yup.object().shape({
  icon: yup
    .mixed<FileList>()
    .test('file-required', 'Organization icon is required', (value) => {
      return value.length > 0
    })
    .test('file-size', 'Image size cannot be larger than 3MB', (value) => {
      return value.length === 0 || value[0].size <= 3000000
    })
    .test('file-type', 'This file is not an image', (value) => {
      return value.length === 0 || isImage(value[0])
    }),
})

const EditOrganizationIconModal = () => {
  const { organizationId } = useParams<OrganizationParams>()
  const dispatch = useDispatch<AppDispatch>()
  const history = useHistory()
  const modalParentPath = useModalParentPath()

  const iconUrl = useSelector<RootState, string | undefined>(
    (state) => state.memberships.entity[organizationId].organization.iconUrl
  )

  const {
    control,
    watch,
    setValue,
    formState,
    handleSubmit,
    errors,
    reset,
  } = useForm<EditOrganizationIconFormData>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
  })

  const [genericError, setGenericError] = useState<string | null>()

  const icon = watch('icon')

  useEffect(() => {
    bsCustomFileInput.init()
  })

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return undefined
    }
    setValue('icon', event.target.files, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset()
    }
  }, [formState.isSubmitSuccessful, reset])

  const submit = async (formData: EditOrganizationIconFormData) => {
    setGenericError(null)
    const resultAction = await dispatch(
      editOrganizationIcon({
        organizationId: organizationId,
        body: toFormData(formData),
      })
    )
    if (editOrganizationIcon.fulfilled.match(resultAction)) {
      history.replace(modalParentPath)
      return
    }
    setGenericError('Unable to change organization icon')
  }

  return (
    <GenericModal
      title="Organization icon"
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
          {iconUrl || (icon && icon.length > 0) ? (
            <HiddenAltImage
              title="Organization Icon"
              src={icon && icon.length > 0 ? toImageURL(icon) : iconUrl}
              width="5rem"
              height="5rem"
            />
          ) : (
            'No icon'
          )}
        </div>
        <Form.Group controlId="icon">
          <Form.Label>Organization icon</Form.Label>
          <Controller
            as={
              <Form.File custom>
                <Form.File.Input
                  name="icon"
                  onChange={handleChange}
                  isInvalid={!!errors.icon}
                  accept="image/*"
                />
                <Form.File.Label data-browse="Browse">
                  Choose file
                </Form.File.Label>
                <Form.Control.Feedback type="invalid">
                  {errors.icon?.message}
                </Form.Control.Feedback>
              </Form.File>
            }
            control={control}
            name="icon"
            defaultValue={[]}
          />
        </Form.Group>
      </Form>
    </GenericModal>
  )
}

export default EditOrganizationIconModal
