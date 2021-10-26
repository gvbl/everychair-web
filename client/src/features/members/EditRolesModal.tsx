import React, { useEffect, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { Check } from 'react-bootstrap-icons'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import LoadingButton from '../../components/LoadingButton'
import GenericModal from '../../components/modals/GenericModal'
import useModalParentPath from '../../hooks/UseModalParentPath'
import Member from '../../models/api/Member'
import { Role } from '../../models/api/Role'
import { MemberParams } from '../../models/MemberParams'
import { RootState } from '../../store'
import { syncMembership } from '../app/membershipsSlice'
import { editRoles } from './membersSlice'

interface EditRoleFormData {
  isAdmin: boolean
  isCleaning: boolean
}

export interface EditRolesData {
  membershipId: string
  body: {
    roles: Role[]
  }
}

interface EditRolesModalSelected {
  member: Member
  isSelf: boolean
  cleaning: boolean
}

const EditRolesModal = () => {
  const { membershipId } = useParams<MemberParams>()
  const dispatch = useDispatch<AppDispatch>()
  const history = useHistory()
  const modalParentPath = useModalParentPath()

  const { member, isSelf, cleaning } = useSelector<
    RootState,
    EditRolesModalSelected
  >((state) => {
    const member = state.members.entity[membershipId]
    return {
      member: member,
      isSelf: state.user.entity?.id === member.userId,
      cleaning:
        state.memberships.entity[member.organizationId].organization.cleaning,
    }
  })

  const {
    control,
    formState,
    handleSubmit,
    reset,
  } = useForm<EditRoleFormData>()

  const [genericError, setGenericError] = useState<string | null>()

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset()
    }
  }, [formState.isSubmitSuccessful, reset])

  if (!member) {
    return null
  }

  const submit = async (formData: EditRoleFormData) => {
    setGenericError(null)
    const roles = [Role.STANDARD]
    if (member.roles.includes(Role.OWNER)) {
      roles.push(Role.OWNER)
    }
    if (isSelf || member.roles.includes(Role.OWNER) || formData.isAdmin) {
      roles.push(Role.ADMIN)
    }
    if (formData.isCleaning) {
      roles.push(Role.CLEANING)
    }
    const resultAction = await dispatch(
      editRoles({
        membershipId: member.membershipId,
        body: {
          roles: roles,
        },
      })
    )
    if (editRoles.fulfilled.match(resultAction)) {
      if (isSelf) {
        await dispatch(
          syncMembership({
            organizationId: member.organizationId,
            roles: roles,
          })
        )
      }
      history.replace(modalParentPath)
      return
    }
    setGenericError('Unable to change roles')
  }

  return (
    <GenericModal
      title="Edit role"
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
        {member.roles.includes(Role.OWNER) && (
          <div className="d-flex align-items-center">
            <Check color="green" />
            <span style={{ marginLeft: '0.25rem' }}>Owner</span>
          </div>
        )}
        {isSelf || member.roles.includes(Role.OWNER) ? (
          <div className="d-flex align-items-center">
            <Check color="green" />
            <span style={{ marginLeft: '0.25rem' }}>Admin</span>
          </div>
        ) : (
          <Controller
            render={({ onChange, value }) => (
              <Form.Check
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  onChange(event.target.checked)
                }}
                onBlur={undefined}
                checked={value}
                type="checkbox"
                label="Admin"
                id="admin-checkbox"
              />
            )}
            control={control}
            name="isAdmin"
            defaultValue={member.roles.includes(Role.ADMIN)}
          />
        )}
        {cleaning && (
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
                id="cleaning-checkbox"
              />
            )}
            control={control}
            name="isCleaning"
            defaultValue={member.roles.includes(Role.CLEANING)}
          />
        )}
        <div className="d-flex align-items-center">
          <Check color="green" />
          <span style={{ marginLeft: '0.25rem' }}>Standard</span>
        </div>
      </Form>
    </GenericModal>
  )
}

export default EditRolesModal
