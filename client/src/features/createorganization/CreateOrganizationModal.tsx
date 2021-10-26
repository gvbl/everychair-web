import { yupResolver } from '@hookform/resolvers/yup'
import { useStripe } from '@stripe/react-stripe-js'
import axios from 'axios'
import bsCustomFileInput from 'bs-custom-file-input'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { Alert, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import * as yup from 'yup'
import { AppDispatch } from '../..'
import HiddenAltImage from '../../components/HiddenAltImage'
import LoadingButton from '../../components/LoadingButton'
import GenericModal from '../../components/modals/GenericModal'
import { Plan } from '../../models/api/Plan'
import { Role } from '../../models/api/Role'
import { isSmallScreen } from '../../models/mediaQueries'
import { RootState } from '../../store'
import { addServerErrors } from '../../util/errors'
import { isImage, toImageURL } from '../../util/image'
import { useQuery } from '../../util/query'
import { linkDomain, toFormData } from '../../util/util'
import { createOrganization } from '../app/membershipsSlice'
import { syncPersonalName } from '../app/userSlice'
import { resetDesks } from '../desks/desksSlice'
import { resetLocations } from '../desks/locationsSlice'
import { resetSpaces } from '../desks/spacesSlice'
import { resetInvitations } from '../members/invitationsSlice'
import { resetMembers } from '../members/membersSlice'
import PlanSelector from './PlanSelector'

export interface CreateOrganizationFormData {
  plan: Plan
  firstName?: string
  lastName?: string
  name: string
  icon: FileList
  cleaning: boolean
}

const generateSchema = (requirePersonalName: boolean) => {
  return yup.object().shape({
    firstName: yup
      .string()
      .test('first-name', 'First name is required', (value) => {
        return !requirePersonalName || !!value
      }),
    lastName: yup
      .string()
      .test('last-name', 'Last name is required', (value) => {
        return !requirePersonalName || !!value
      }),
    name: yup.string().required('Organization name is required'),
    icon: yup
      .mixed<FileList>()
      .test('file-size', 'Image size cannot be larger than 3MB', (value) => {
        return value.length === 0 || value[0].size <= 3000000
      })
      .test('file-type', 'This file is not an image', (value) => {
        return value.length === 0 || isImage(value[0])
      }),
  })
}

interface CreateOrganizationModalSelected {
  requirePersonalName: boolean
  isBelowQuota: boolean
}

const CreateOrganizationModal = () => {
  const planQueryParam = useQuery().get('plan')
  const history = useHistory()
  const dispatch = useDispatch<AppDispatch>()
  const stripe = useStripe()

  const { requirePersonalName, isBelowQuota } = useSelector<
    RootState,
    CreateOrganizationModalSelected
  >((state) => {
    return {
      requirePersonalName:
        !state.user.entity?.firstName && !state.user.entity?.lastName,
      isBelowQuota:
        Object.values(state.memberships.entity).filter(
          (membership) =>
            membership.roles.includes(Role.OWNER) &&
            membership.organization.plan === Plan.FREE
        ).length === 0,
    }
  })

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    errors,
    setError,
    formState,
    reset,
  } = useForm<CreateOrganizationFormData>({
    mode: 'onTouched',
    resolver: yupResolver(generateSchema(requirePersonalName)),
  })

  const [genericError, setGenericError] = useState<string | null>()

  const defaultPlan = () => {
    if (planQueryParam) {
      return Plan[planQueryParam as keyof typeof Plan]
    }
    if (isBelowQuota) {
      return Plan.FREE
    }
    return Plan.STARTER
  }

  const plan = watch('plan', defaultPlan())
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

  const submit = async (formData: CreateOrganizationFormData) => {
    setGenericError(null)
    const resultAction = await dispatch(
      createOrganization(
        toFormData({
          ...formData,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        })
      )
    )
    if (createOrganization.fulfilled.match(resultAction)) {
      const organizationId = Object.values(resultAction.payload)[0].organization
        .id
      if (formData.firstName && formData.lastName) {
        await dispatch(
          syncPersonalName({
            firstName: formData.firstName,
            lastName: formData.lastName,
          })
        )
      }
      await Promise.all([
        dispatch(resetMembers()),
        dispatch(resetInvitations()),
        dispatch(resetLocations()),
        dispatch(resetSpaces()),
        dispatch(resetDesks()),
      ])
      if (plan === Plan.FREE) {
        history.push(
          `/manage/organizations/${organizationId}/organization-welcome`
        )
        return
      }
      if (!stripe) {
        console.error('stripe is null')
        history.push(
          `/manage/organizations/${organizationId}/organization-welcome?error=subscriptionError&plan=${plan}`
        )
        return
      }
      try {
        const encodedCancelRedirect = encodeURIComponent(
          `/manage/organizations/${organizationId}/organization-welcome?warning=checkoutCancelled&plan=${plan}`
        )
        const { data } = await axios.post(
          `/api/organizations/${organizationId}/checkout-plan`,
          {
            plan: plan,
            successUrl: `${linkDomain()}/manage/organizations/${organizationId}/organization-welcome?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${linkDomain()}/cancel-checkout/${organizationId}?redirect=${encodedCancelRedirect}`,
          }
        )
        await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        })
      } catch (err: any) {
        history.push(
          `/manage/organizations/${organizationId}/organization-welcome?error=subscriptionError&plan=${plan}`
        )
      }
    } else if (createOrganization.rejected.match(resultAction)) {
      const serverErrors = resultAction.payload
      if (serverErrors) {
        addServerErrors<CreateOrganizationFormData>(serverErrors, setError)
        return
      }
      setGenericError('Unable to create organization')
    }
  }

  return (
    <GenericModal
      title="Create organization"
      footer={
        <LoadingButton
          type="submit"
          loading={formState.isSubmitting}
          onClick={() => handleSubmit(submit)()}
        >
          Create
        </LoadingButton>
      }
      show
      scrollable={true}
      onHide={() => {
        reset()
        setGenericError(null)
      }}
    >
      {genericError && <Alert variant="danger"> {genericError} </Alert>}
      <Form onSubmit={handleSubmit(submit)}>
        <Form.Group controlId="plan" style={{ marginBottom: '0' }}>
          <Form.Label>Plan</Form.Label>
          <Controller
            render={({ onChange, value }) => (
              <PlanSelector
                onChange={onChange}
                value={value}
                disableFree={!isBelowQuota}
              />
            )}
            control={control}
            name="plan"
            defaultValue={defaultPlan()}
          />
        </Form.Group>
        {requirePersonalName && (
          <Form.Row
            className="d-flex"
            style={{ justifyContent: 'space-between' }}
          >
            <Form.Group
              controlId="firstName"
              style={isSmallScreen() ? { flexGrow: 1 } : {}}
            >
              <Form.Label className="required">Your name</Form.Label>
              <Controller
                as={<Form.Control />}
                control={control}
                name="firstName"
                placeholder="Enter first name"
                autoComplete="off"
                isInvalid={!!errors.firstName}
                defaultValue=""
              />
              <Form.Control.Feedback type="invalid">
                {errors.firstName?.message}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group
              controlId="lastName"
              style={isSmallScreen() ? { flexGrow: 1 } : {}}
            >
              <Form.Label
                style={{ visibility: 'hidden' }}
                hidden={isSmallScreen()}
              >
                Your name
              </Form.Label>
              <Controller
                as={<Form.Control />}
                control={control}
                name="lastName"
                placeholder="Enter last name"
                autoComplete="off"
                isInvalid={!!errors.lastName}
                defaultValue=""
              />
              <Form.Control.Feedback type="invalid">
                {errors.lastName?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Form.Row>
        )}
        <Form.Group controlId="name">
          <Form.Label className="required">Organization name</Form.Label>
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
        <div
          className="d-flex justify-content-center"
          style={{ marginBottom: '1rem' }}
        >
          {icon && icon.length > 0 ? (
            <HiddenAltImage
              title="Organization Icon"
              src={toImageURL(icon)}
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
        <Form.Group controlId="cleaning">
          <Form.Label>
            Enable cleaning management for your organization?
          </Form.Label>
          <Controller
            render={({ onChange, value }) => (
              <Form.Check
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  onChange(event.target.checked)
                }}
                onBlur={undefined}
                checked={value}
                type="checkbox"
                label="Yes"
              />
            )}
            control={control}
            name="cleaning"
            id="cleaning-checkbox"
            defaultValue={false}
          />
          <div style={{ marginTop: '0.5rem' }}>
            This feature allows you to assign cleaning staff members who will
            receive notifications 15 minutes before each reservation ends. They
            can then perform cleaning during a 30 minute period. New
            reservations cannot be booked during this time.
          </div>
        </Form.Group>
      </Form>
    </GenericModal>
  )
}

export default CreateOrganizationModal
