import { createAsyncThunk } from '@reduxjs/toolkit'
import axios, { AxiosError } from 'axios'
import React, { useEffect, useState } from 'react'
import { Button, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { LinkContainer } from 'react-router-bootstrap'
import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useParams,
} from 'react-router-dom'
import { AppDispatch } from '../..'
import Center from '../../components/Center'
import AbsoluteSpinner from '../../components/AbsoluteSpinner'
import StopError from '../../components/StopError'
import Membership from '../../models/api/Membership'
import { Loading } from '../../models/Loading'
import { RootState } from '../../store'
import { ErrorResponse } from '../../util/errors'
import { LogInForm, SignUpForm } from '../app/AuthForm'
import { addMembership } from '../app/membershipsSlice'

interface RsvpParams {
  token: string
}

const sendRsvp = createAsyncThunk<
  undefined,
  string,
  {
    rejectValue: ErrorResponse
  }
>('rsvp/send', async (token: string, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await axios.post<Membership>(`/api/rsvp/${token}`)
    await dispatch(addMembership(data))
  } catch (err: any) {
    const error: AxiosError<ErrorResponse> = err
    if (!error.response) {
      throw err
    }
    return rejectWithValue(error.response.data)
  }
})

const Rsvp = () => {
  const { token } = useParams<RsvpParams>()
  const dispatch = useDispatch<AppDispatch>()

  const [loading, setLoading] = useState(Loading.IDLE)
  const [error, setError] = useState<string | null | undefined>()

  useEffect(() => {
    setLoading(Loading.PENDING)
    setError(null)
    const doSendRsvp = async () => {
      const resultAction = await dispatch(sendRsvp(token))
      if (sendRsvp.fulfilled.match(resultAction)) {
        setLoading(Loading.SUCCEEDED)
      } else if (sendRsvp.rejected.match(resultAction)) {
        setLoading(Loading.FAILED)
        setError(resultAction.payload?.errors[0].msg)
      }
    }
    doSendRsvp()
  }, [token, dispatch, setLoading, setError])

  if (loading === Loading.PENDING) {
    return <AbsoluteSpinner />
  }
  if (loading === Loading.FAILED) {
    if (!error) {
      return <StopError />
    }
    return <StopError details={error} />
  }
  return (
    <Center>
      <Card>
        <Card.Body style={{ display: 'inline' }}>
          <Card.Title>Invitation accepted</Card.Title>
          <Card.Text>Click reservations to begin.</Card.Text>
          <LinkContainer to="/reservations">
            <Button>Reservations</Button>
          </LinkContainer>
        </Card.Body>
      </Card>
    </Center>
  )
}

const RsvpSignUp = () => {
  const { token } = useParams<RsvpParams>()
  const history = useHistory()

  return (
    <Center>
      <p>
        You're invited to reserve desks with Everychair. Sign up to get started.
      </p>
      <p>
        Already have an account?
        <Button
          variant="link"
          onClick={() => history.push(`/rsvp/${token}/login`)}
          style={{ paddingTop: '0', padding: '0 0.5rem 0.25rem' }}
        >
          Log in
        </Button>
      </p>
      <SignUpForm
        origin={`/rsvp/${token}/signup`}
        redirect={`/rsvp/${token}`}
      />
    </Center>
  )
}

const RsvpLogIn = () => {
  const { token } = useParams<RsvpParams>()
  const history = useHistory()

  return (
    <Center>
      <p>
        You're invited to reserve desks with Everychair. Log in to get started.
      </p>
      <p>
        Need to create an account?
        <Button
          variant="link"
          onClick={() => history.push(`/rsvp/${token}/signup`)}
          style={{ padding: '0 0.5rem 0.25rem' }}
        >
          Sign up
        </Button>
      </p>
      <LogInForm origin={`/rsvp/${token}/login`} redirect={`/rsvp/${token}`} />
    </Center>
  )
}

const RsvpPage = () => {
  const { token } = useParams<RsvpParams>()
  const isAuthenticated = useSelector<RootState>((state) => !!state.user.entity)

  if (isAuthenticated) {
    return <Rsvp />
  }

  return (
    <Switch>
      <Route exact path="/rsvp/:token">
        <Redirect to={`/rsvp/${token}/signup`} />
      </Route>
      <Route exact path="/rsvp/:token/signup" component={RsvpSignUp} />
      <Route exact path="/rsvp/:token/login" component={RsvpLogIn} />
    </Switch>
  )
}

export default RsvpPage
