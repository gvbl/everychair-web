import { yupResolver } from '@hookform/resolvers/yup'
import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import { Alert, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import * as yup from 'yup'
import { AppDispatch } from '../..'
import LoadingButton from '../../components/LoadingButton'
import GenericModal from '../../components/modals/GenericModal'
import { OrganizationParams } from '../../models/OrganizationParams'
import { reviveInvitations } from '../../models/revive'
import { RootState } from '../../store'
import { addServerErrors } from '../../util/errors'
import { MultipleEmailsRegex } from '../../util/regex'
import { joinConj } from '../../util/util'
import { createInvitations } from './invitationsSlice'

export interface InviteData {
  organizationId: string
  emails: string[]
}

interface InviteFormData {
  emails: string
}

const rawEmailMatches = (emails?: string | null): string[] => {
  if (!emails) {
    return []
  }
  const matches = emails.match(MultipleEmailsRegex)
  return matches ? matches : []
}

const emailMatches = _.memoize(rawEmailMatches)

const generateSchema = (
  membersEmails: string[],
  invitationsEmails: string[]
) => {
  return yup.object().shape({
    emails: yup
      .string()
      .required('One or more emails required')
      .test(
        'no-emails',
        'No emails detected',
        (value) => emailMatches(value).length > 0
      )
      .test(
        'limit-emails',
        'Limited to 50 invites at a time',
        (value) => emailMatches(value).length <= 50
      )
      .test({
        name: 'member-email',
        test: function (value) {
          const duplicates = emailMatches(value).filter((email) =>
            membersEmails.includes(email)
          )
          if (duplicates.length === 0) {
            return true
          } else if (duplicates.length === 1) {
            return this.createError({
              message: `${duplicates[0]} is already a member`,
            })
          }
          return this.createError({
            message: `${joinConj(duplicates, ', ', 'and')} are already members`,
          })
        },
      })
      .test({
        name: 'invitation-email',
        test: function (value) {
          const duplicates = emailMatches(value).filter((email) =>
            invitationsEmails.includes(email)
          )
          if (duplicates.length === 0) {
            return true
          } else if (duplicates.length === 1) {
            return this.createError({
              message: `${duplicates[0]} has already received an invitation`,
            })
          }
          return this.createError({
            message: `${joinConj(
              duplicates,
              ', ',
              'and'
            )} have already received invitations`,
          })
        },
      }),
  })
}

const prepEmails = (data: InviteFormData): string[] => {
  if (!data.emails) {
    return []
  }
  const emails = data.emails.match(MultipleEmailsRegex)
  if (!emails) {
    return []
  }
  return emails.map<string>((email) => email.toString())
}

const renderCount = (emails?: string) => {
  const count = emailMatches(emails).length
  return (
    <>
      <b>{count}</b> {count === 1 ? 'email' : 'emails'} detected
    </>
  )
}

interface InviteModalSelected {
  membersEmails: string[]
  invitationsEmails: string[]
}

const InviteModal = () => {
  const { organizationId } = useParams<OrganizationParams>()
  const { membersEmails, invitationsEmails } = useSelector<
    RootState,
    InviteModalSelected
  >((state) => {
    return {
      membersEmails: Object.values(state.members.entity)
        .filter((member) => member.organizationId === organizationId)
        .map((member) => member.email),
      invitationsEmails: reviveInvitations(
        Object.values(state.invitations.entity)
      )
        .filter((invitation) => invitation.organizationId === organizationId)
        .map((invitation) => invitation.email),
    }
  })
  const {
    control,
    watch,
    handleSubmit,
    errors,
    setError,
    formState,
    reset,
  } = useForm<InviteFormData>({
    mode: 'onTouched',
    resolver: yupResolver(generateSchema(membersEmails, invitationsEmails)),
  })
  const dispatch = useDispatch<AppDispatch>()
  const history = useHistory()
  const [genericError, setGenericError] = useState<string | null>()

  const watchEmails = watch('emails')

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset()
    }
  }, [formState.isSubmitSuccessful, reset])

  const submit = async (data: InviteFormData) => {
    setGenericError(null)
    const emails = prepEmails(data)
    const resultAction = await dispatch(
      createInvitations({
        organizationId: organizationId,
        emails: emails,
      })
    )
    if (createInvitations.fulfilled.match(resultAction)) {
      const firstInvitation = Object.values(resultAction.payload)[0]
      history.push(
        `/manage/organizations/${organizationId}/members/invitations/${firstInvitation.id}`
      )
    } else if (createInvitations.rejected.match(resultAction)) {
      const serverErrors = resultAction.payload
      if (serverErrors) {
        addServerErrors<InviteFormData>(serverErrors, setError)
        return
      }
      setGenericError('Unable to send invitations')
    }
  }

  return (
    <GenericModal
      title="Invite"
      footer={
        <LoadingButton
          type="submit"
          loading={formState.isSubmitting}
          onClick={() => handleSubmit(submit)()}
        >
          Send
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
        <Form.Group controlId="emails">
          <Form.Label>Emails</Form.Label>
          <Controller
            as={<Form.Control as="textarea" />}
            control={control}
            name="emails"
            rows={4}
            placeholder="Enter emails"
            autoComplete="off"
            isInvalid={!!errors.emails}
            defaultValue=""
          />
          <Form.Control.Feedback type="invalid">
            {errors.emails?.message}
          </Form.Control.Feedback>
          <Form.Text>{renderCount(watchEmails)}</Form.Text>
        </Form.Group>
      </Form>
    </GenericModal>
  )
}

export default InviteModal
