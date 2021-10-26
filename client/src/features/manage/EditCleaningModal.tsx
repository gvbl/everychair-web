import React, { useEffect, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import LoadingButton from '../../components/LoadingButton'
import GenericModal from '../../components/modals/GenericModal'
import useModalParentPath from '../../hooks/UseModalParentPath'
import Member from '../../models/api/Member'
import Organization from '../../models/api/Organization'
import { Role } from '../../models/api/Role'
import { OrganizationParams } from '../../models/OrganizationParams'
import { RootState } from '../../store'
import { editCleaning } from '../app/membershipsSlice'
import { syncFormerCleaningMembers } from '../members/membersSlice'

interface EditCleaningFormData {
  cleaning: boolean
}

export interface EditCleaningData {
  organizationId: string
  body: EditCleaningFormData
}

interface EditCleaningModalSelected {
  organization: Organization
  cleaningMembers: Member[]
}

const EditCleaningModal = () => {
  const { organizationId } = useParams<OrganizationParams>()
  const history = useHistory()
  const modalParentPath = useModalParentPath()

  const [genericError, setGenericError] = useState<string | null>()

  const { organization, cleaningMembers } = useSelector<
    RootState,
    EditCleaningModalSelected
  >((state) => {
    return {
      organization: state.memberships.entity[organizationId].organization,
      cleaningMembers: Object.values(state.members.entity).filter(
        (member) =>
          member.organizationId === organizationId &&
          member.roles.includes(Role.CLEANING)
      ),
    }
  })

  const {
    control,
    formState,
    handleSubmit,
    reset,
  } = useForm<EditCleaningFormData>()

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset()
    }
  }, [formState.isSubmitSuccessful, reset])

  if (!organization) {
    return null
  }

  const submit = async (formData: EditCleaningFormData) => {
    setGenericError(null)
    const resultAction = await dispatch(
      editCleaning({
        organizationId: organizationId,
        body: formData,
      })
    )
    if (editCleaning.fulfilled.match(resultAction)) {
      if (!formData.cleaning) {
        const formerCleaningMembers = cleaningMembers.map((cleaningMember) => {
          return {
            ...cleaningMember,
            roles: cleaningMember.roles.filter(
              (role) => role !== Role.CLEANING
            ),
          }
        })
        await dispatch(syncFormerCleaningMembers(formerCleaningMembers))
      }
      history.replace(modalParentPath)
      return
    }
    setGenericError('Unable to change cleaning')
  }

  return (
    <GenericModal
      title="Cleaning"
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
        <Form.Group controlId="cleaning">
          <Controller
            render={({ onChange, value }) => (
              <Form.Check
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  onChange(event.target.checked)
                }}
                onBlur={undefined}
                checked={value}
                type="checkbox"
                label="Cleaning"
              />
            )}
            control={control}
            name="cleaning"
            id="edit-cleaning-checkbox"
            defaultValue={organization.cleaning}
          />
        </Form.Group>
      </Form>
      <br />
      Cleaning roles will be revoked when cleaning is disabled.
    </GenericModal>
  )
}

export default EditCleaningModal
