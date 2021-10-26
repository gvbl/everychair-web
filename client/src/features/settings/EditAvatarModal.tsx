import { yupResolver } from '@hookform/resolvers/yup'
import bsCustomFileInput from 'bs-custom-file-input'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { PersonFill } from 'react-bootstrap-icons'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import * as yup from 'yup'
import { AppDispatch } from '../..'
import { Shape } from '../../components/HiddenAltImage'
import IconAltImage from '../../components/IconAltImage'
import LoadingButton from '../../components/LoadingButton'
import GenericModal from '../../components/modals/GenericModal'
import useModalParentPath from '../../hooks/UseModalParentPath'
import { Role } from '../../models/api/Role'
import { RootState } from '../../store'
import { isImage, toImageURL } from '../../util/image'
import { toFormData } from '../../util/util'
import { editAvatar } from '../app/userSlice'
import { syncSelfMemberAvatarUrl } from '../members/membersSlice'

export interface EditAvatarData {
  userId: string
  body: FormData
}

export interface SyncSelfMemberAvatarUrlData {
  membershipId: string
  avatarUrl?: string
}

interface EditAvatarFormData {
  avatar: FileList
}

interface EditNameSelected {
  userId?: string
  avatarUrl?: string
  isAdmin: boolean
  selfMembershipIds: string[]
}

const schema = yup.object().shape({
  avatar: yup
    .mixed<FileList>()
    .test('file-required', 'Avatar is required', (value) => {
      return value.length > 0
    })
    .test('file-size', 'Image size cannot be larger than 3MB', (value) => {
      return value.length === 0 || value[0].size <= 3000000
    })
    .test('file-type', 'This file is not an image', (value) => {
      return value.length === 0 || isImage(value[0])
    }),
})

const EditAvatarModal = () => {
  const dispatch = useDispatch<AppDispatch>()
  const history = useHistory()
  const modalParentPath = useModalParentPath()

  const { userId, avatarUrl, isAdmin, selfMembershipIds } = useSelector<
    RootState,
    EditNameSelected
  >((state) => {
    const userId = state.user.entity?.id
    return {
      userId: userId,
      avatarUrl: state.user.entity?.avatarUrl,
      isAdmin:
        Object.values(state.memberships.entity).filter((membership) =>
          membership.roles.includes(Role.ADMIN)
        ).length > 0,
      selfMembershipIds: Object.values(state.members.entity)
        .filter((member) => member.userId === userId)
        .map((member) => member.membershipId),
    }
  })

  const {
    control,
    watch,
    setValue,
    formState,
    handleSubmit,
    errors,
    reset,
  } = useForm<EditAvatarFormData>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
  })

  const [genericError, setGenericError] = useState<string | null>()

  const avatar = watch('avatar')

  useEffect(() => {
    bsCustomFileInput.init()
  })

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset()
    }
  }, [formState.isSubmitSuccessful, reset])

  if (!userId) {
    return null
  }

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return undefined
    }
    setValue('avatar', event.target.files, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const submit = async (formData: EditAvatarFormData) => {
    setGenericError(null)
    const resultAction = await dispatch(
      editAvatar({
        userId: userId,
        body: toFormData(formData),
      })
    )
    if (editAvatar.fulfilled.match(resultAction)) {
      if (isAdmin) {
        for (let i = 0; i < selfMembershipIds.length; i++) {
          await dispatch(
            syncSelfMemberAvatarUrl({
              membershipId: selfMembershipIds[i],
              avatarUrl: resultAction.payload,
            })
          )
        }
      }
      history.replace(modalParentPath)
      return
    }
    setGenericError('Unable to change avatar')
  }

  return (
    <GenericModal
      title="Edit avatar"
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
          {avatar ? (
            <IconAltImage
              title="Avatar"
              src={toImageURL(avatar)}
              width="5rem"
              height="5rem"
              icon={<PersonFill color="white" size={48} />}
              shape={Shape.RoundedCircle}
            />
          ) : (
            <IconAltImage
              title="Avatar"
              src={avatarUrl}
              width="5rem"
              height="5rem"
              icon={<PersonFill color="white" size={48} />}
              shape={Shape.RoundedCircle}
            />
          )}
        </div>
        <Form.Group controlId="avatar">
          <Form.Label>Avatar</Form.Label>
          <Controller
            as={
              <Form.File custom>
                <Form.File.Input
                  name="avatar"
                  onChange={handleChange}
                  isInvalid={!!errors.avatar}
                  accept="image/*"
                />
                <Form.File.Label data-browse="Browse">
                  Choose file
                </Form.File.Label>
                <Form.Control.Feedback type="invalid">
                  {errors.avatar?.message}
                </Form.Control.Feedback>
              </Form.File>
            }
            control={control}
            name="avatar"
            defaultValue={[]}
          />
        </Form.Group>
      </Form>
    </GenericModal>
  )
}

export default EditAvatarModal
