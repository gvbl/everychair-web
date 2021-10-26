import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { ButtonProps } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '..'
import { Loading } from '../models/Loading'
import { RootState } from '../store'
import LoadingButton from './LoadingButton'

const sendEmailConfirmation = createAsyncThunk(
  'emailConfirmation/send',
  async (userId: string) => {
    await axios.post(`/api/users/${userId}/send-email-confirmation`)
  }
)

interface EmailConfirmationButtonProps extends ButtonProps {
  onLoadingChanged: (loading: Loading) => void
}

const EmailConfirmationButton = ({
  onLoadingChanged,
  ...props
}: EmailConfirmationButtonProps) => {
  const dispatch = useDispatch<AppDispatch>()

  const userId = useSelector<RootState, string | undefined>(
    (state) => state.user.entity?.id
  )

  const [loading, setLoading] = useState(Loading.IDLE)

  useEffect(() => {
    onLoadingChanged(loading)
  }, [loading, onLoadingChanged])

  if (!userId) {
    return null
  }

  const submit = async () => {
    setLoading(Loading.PENDING)
    const resultAction = await dispatch(sendEmailConfirmation(userId))
    if (sendEmailConfirmation.fulfilled.match(resultAction)) {
      setLoading(Loading.SUCCEEDED)
    } else if (sendEmailConfirmation.rejected.match(resultAction)) {
      setLoading(Loading.FAILED)
    }
  }

  return (
    <LoadingButton
      type="submit"
      loading={loading === Loading.PENDING}
      onClick={submit}
      {...props}
    >
      Send confirmation
    </LoadingButton>
  )
}

export default EmailConfirmationButton
