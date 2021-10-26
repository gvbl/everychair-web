import { createAsyncThunk } from '@reduxjs/toolkit'
import axios, { AxiosError } from 'axios'
import React, { useEffect, useState } from 'react'
import { Button, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { LinkContainer } from 'react-router-bootstrap'
import { useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import Center from '../../components/Center'
import AbsoluteSpinner from '../../components/AbsoluteSpinner'
import StopError from '../../components/StopError'
import { Role } from '../../models/api/Role'
import { Loading } from '../../models/Loading'
import { RootState } from '../../store'
import { ErrorResponse } from '../../util/errors'
import { LogInForm } from '../app/AuthForm'
import { syncEmailConfirmed } from '../app/userSlice'

interface ContinueCardProps {
  message: string
  to: string
  buttonText: string
}

const ContinueCard = ({ message, to, buttonText }: ContinueCardProps) => {
  return (
    <Center>
      <Card>
        <Card.Body style={{ display: 'inline' }}>
          <Card.Title>Email confirmed</Card.Title>
          <Card.Text>{message}</Card.Text>
          <LinkContainer to={to}>
            <Button>{buttonText}</Button>
          </LinkContainer>
        </Card.Body>
      </Card>
    </Center>
  )
}

interface ConfirmEmailData {
  userId: string
  token: string
}

const confirmEmail = createAsyncThunk<
  undefined,
  ConfirmEmailData,
  {
    rejectValue: ErrorResponse
  }
>(
  'emailConfirmation/confirm',
  async (confirmEmailData: ConfirmEmailData, { dispatch, rejectWithValue }) => {
    try {
      await axios
        .post(
          `/api/users/${confirmEmailData.userId}/confirm-email/${confirmEmailData.token}`
        )
        .then(() => dispatch(syncEmailConfirmed()))
    } catch (err: any) {
      const error: AxiosError<ErrorResponse> = err
      if (!error.response) {
        throw err
      }
      return rejectWithValue(error.response.data)
    }
  }
)

interface ConfirmationProps {
  token: string
}

interface EmailConfirmationSelected {
  userId?: string
  isMember: boolean
  isAdmin: boolean
}

const EmailConfirmation = ({ token }: ConfirmationProps) => {
  const dispatch = useDispatch<AppDispatch>()

  const { userId, isMember, isAdmin } = useSelector<
    RootState,
    EmailConfirmationSelected
  >((state) => {
    const memberships = Object.values(state.memberships.entity)
    return {
      userId: state.user.entity?.id,
      isMember: memberships.length > 0,
      isAdmin:
        Object.values(state.memberships.entity).filter((membership) =>
          membership.roles.includes(Role.ADMIN)
        ).length > 0,
    }
  })

  const [loading, setLoading] = useState(Loading.IDLE)
  const [error, setError] = useState<string | null | undefined>()

  useEffect(() => {
    if (!userId) {
      setLoading(Loading.FAILED)
      return
    }

    const doConfirmEmail = async () => {
      setLoading(Loading.PENDING)
      const resultAction = await dispatch(
        confirmEmail({ userId: userId, token: token })
      )
      if (confirmEmail.fulfilled.match(resultAction)) {
        setLoading(Loading.SUCCEEDED)
      } else if (confirmEmail.rejected.match(resultAction)) {
        setLoading(Loading.FAILED)
        setError(resultAction.payload?.errors[0].msg)
      }
    }
    doConfirmEmail()
  }, [userId, token, dispatch, setLoading])

  if (loading === Loading.PENDING) {
    return <AbsoluteSpinner />
  }
  if (loading === Loading.FAILED) {
    if (!error) {
      return <StopError />
    }
    return <StopError details={error} />
  }
  if (isAdmin) {
    return (
      <ContinueCard
        message="Continue to the Manage console to invite members."
        to="/manage"
        buttonText="Manage"
      />
    )
  } else if (isMember) {
    return (
      <ContinueCard
        message="Continue to the reservations screen."
        to="/reservations"
        buttonText="Reservations"
      />
    )
  } else {
    return (
      <ContinueCard
        message="Click start to begin."
        to="/start"
        buttonText="Start"
      />
    )
  }
}

const EmailConfirmationLogIn = ({ token }: ConfirmationProps) => {
  return (
    <Center>
      <p>Log in to continue with email confirmation.</p>
      <LogInForm
        origin={`/email-confirmation/${token}`}
        redirect={`/email-confirmation/${token}`}
      />
    </Center>
  )
}

interface EmailConfirmationParams {
  token: string
}

const EmailConfirmationPage = () => {
  const { token } = useParams<EmailConfirmationParams>()
  const isAuthenticated = useSelector<RootState>((state) => !!state.user.entity)

  if (isAuthenticated) {
    return <EmailConfirmation token={token} />
  }
  return <EmailConfirmationLogIn token={token} />
}

export default EmailConfirmationPage
