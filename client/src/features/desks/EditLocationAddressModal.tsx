import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import * as yup from 'yup'
import { AppDispatch } from '../..'
import LoadingButton from '../../components/LoadingButton'
import LoadingModal from '../../components/LoadingModal'
import GenericModal from '../../components/modals/GenericModal'
import useModalParentPath from '../../hooks/UseModalParentPath'
import { Address } from '../../models/api/Location'
import { isLoading, Loading } from '../../models/Loading'
import { LocationParams } from '../../models/LocationParams'
import { RootState } from '../../store'
import { addServerErrors } from '../../util/errors'
import { ZipCodeRegEx } from '../../util/regex'
import { StatesAbbrs } from '../../util/states'
import AddressFormFields from './AddressFormFields'
import { editLocationAddress } from './locationsSlice'

export interface EditLocationAddressData {
  locationId: string
  body: Address
}

const schema = yup.object().shape({
  street: yup.string().required('Address is required'),
  state: yup.string().test('valid-state', 'Invalid state', (value) => {
    return !value || StatesAbbrs.includes(value as string)
  }),
  zip: yup.string().test('valid-zip', 'Invalid zip', (value) => {
    return !value || !!ZipCodeRegEx.exec(value)
  }),
})

interface EditLocationAddressModalSelected {
  address?: Address
  locationsLoading: Loading
}

const EditLocationAddressModal = () => {
  const { locationId } = useParams<LocationParams>()
  const dispatch = useDispatch<AppDispatch>()
  const history = useHistory()
  const modalParentPath = useModalParentPath()

  const [genericError, setGenericError] = useState<string | null>()

  const { address, locationsLoading } = useSelector<
    RootState,
    EditLocationAddressModalSelected
  >((state) => {
    return {
      address: state.locations.entity[locationId]?.address,
      locationsLoading: state.locations.loading,
    }
  })

  const {
    control,
    formState,
    handleSubmit,
    errors,
    setError,
    reset,
  } = useForm<Address>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset()
    }
  }, [formState.isSubmitSuccessful, reset])

  const submit = async (formData: Address) => {
    setGenericError(null)
    const resultAction = await dispatch(
      editLocationAddress({
        locationId: locationId,
        body: formData,
      })
    )
    if (editLocationAddress.fulfilled.match(resultAction)) {
      history.replace(modalParentPath)
      return
    } else if (editLocationAddress.rejected.match(resultAction)) {
      const serverErrors = resultAction.payload
      if (serverErrors) {
        addServerErrors<Address>(serverErrors, setError)
        return
      }
      setGenericError('Unable to change location address')
    }
  }

  if (isLoading(locationsLoading)) {
    return <LoadingModal title="Edit location address" />
  }
  if (locationsLoading === Loading.FAILED) {
    return <LoadingModal title="Edit location address" error />
  }

  return (
    <GenericModal
      title="Edit location address"
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
        <AddressFormFields
          control={control}
          errors={errors}
          defaults={address}
        />
      </Form>
    </GenericModal>
  )
}

export default EditLocationAddressModal
