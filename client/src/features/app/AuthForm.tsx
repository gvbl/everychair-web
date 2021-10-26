import { yupResolver } from '@hookform/resolvers/yup'
import { AsyncThunk } from '@reduxjs/toolkit'
import React, { useState } from 'react'
import { Alert, Button, Form, Image } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { LinkContainer } from 'react-router-bootstrap'
import { Link, useHistory, useLocation } from 'react-router-dom'
import * as yup from 'yup'
import { AppDispatch } from '../..'
import LoadingButton from '../../components/LoadingButton'
import { upOnePath } from '../../hooks/ModalPaths'
import User from '../../models/api/User'
import { RootState } from '../../store'
import {
  addServerErrors,
  hasFormFeedback,
  ValidationError,
} from '../../util/errors'
import { useQuery } from '../../util/query'
import { captchaSiteKey } from '../../util/util'
import { fetchMemberships } from './membershipsSlice'
import { logIn, signUp } from './userSlice'

const existingScript = document.getElementById('grecaptcha')
if (!existingScript) {
  const script = document.createElement('script')
  script.src = `https://www.google.com/recaptcha/api.js?render=${captchaSiteKey()}`
  script.id = 'grecaptcha'
  document.body.appendChild(script)
}

enum AuthFormType {
  SIGNUP = 'SIGNUP',
  LOGIN = 'LOGIN',
}

export interface AuthData {
  email: string
  password: string
  captcha: string
}

interface AuthFormData {
  email: string
  password: string
}

const signUpError = (error: string | null): string | null => {
  if (error === 'googleAccountExistsError') {
    return 'An account is already associated with this Google account.'
  } else if (error === 'googleNoEmailError') {
    return 'No email associated with this Google account.'
  } else if (error === 'googleLinkError') {
    return 'This email is already associated with an account.'
  } else if (error) {
    return 'Unable to sign up'
  }
  return null
}

const logInError = (error: string | null): string | null => {
  if (error === 'googleLinkError') {
    return 'This account is not linked to your Google account.  Use your account email and password to log in.'
  } else if (error === 'googleNoAccountError') {
    return 'No account associated with this Google account.'
  } else if (error) {
    return 'Unable to log in'
  }
  return null
}

const OrSeparator = () => {
  return (
    <div
      className="d-flex align-items-center"
      style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}
    >
      <hr className="w-100" />
      <span
        style={{
          marginLeft: '0.5rem',
          marginRight: '0.5rem',
          marginTop: '-0.25rem',
        }}
      >
        or
      </span>
      <hr className="w-100" />
    </div>
  )
}

const GoogleLogo = () => {
  return (
    <Image
      src="/assets/images/g-logo.png"
      style={{
        position: 'absolute',
        left: '1.75rem',
        width: '1.5rem',
        height: '1.5rem',
      }}
      roundedCircle
    />
  )
}

interface AuthFormProps {
  origin: string
  redirect?: string
}

export const SignUpForm = ({ origin, redirect }: AuthFormProps) => {
  const error = useQuery().get('error')
  const googleAuthLink = redirect
    ? `/api/signup/google?origin=${encodeURIComponent(
        origin
      )}&redirect=${encodeURIComponent(redirect)}`
    : `/api/signup/google?origin=${encodeURIComponent(origin)}`
  return AuthForm(
    AuthFormType.SIGNUP,
    signUp,
    googleAuthLink,
    signUpError(error),
    redirect
  )
}

export const LogInForm = ({ origin, redirect }: AuthFormProps) => {
  const error = useQuery().get('error')
  const googleAuthLink = redirect
    ? `/api/login/google?origin=${encodeURIComponent(
        origin
      )}&redirect=${encodeURIComponent(redirect)}`
    : `/api/login/google?origin=${encodeURIComponent(origin)}`
  return AuthForm(
    AuthFormType.LOGIN,
    logIn,
    googleAuthLink,
    logInError(error),
    redirect
  )
}

const AuthForm = (
  type: AuthFormType,
  authSubmit: AsyncThunk<
    User,
    AuthData,
    { state: RootState; rejectValue: ValidationError[] }
  >,
  googleAuthLink: string,
  initError: string | null,
  redirect?: string
) => {
  const schema = yup.object().shape({
    email: yup
      .string()
      .required('Email is required')
      .email('Email is not valid'),
    password: yup
      .string()
      .required('Password is required')
      .test(
        'password-length',
        'Password must be at least 8 characters long',
        (value) => {
          return !value || type === AuthFormType.LOGIN || value.length >= 8
        }
      ),
  })
  const history = useHistory()
  const urlLocation = useLocation()
  const dispatch = useDispatch<AppDispatch>()
  const [genericError, setGenericError] = useState<string | null>(initError)
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    control,
    handleSubmit,
    errors,
    setError,
    formState,
    trigger,
  } = useForm<AuthFormData>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
  })

  const generateSubmit = (captcha: string) => {
    return async (authFormData: AuthFormData) => {
      setGenericError(null)
      const resultAction = await dispatch(
        authSubmit({ captcha: captcha, ...authFormData })
      )
      if (authSubmit.fulfilled.match(resultAction)) {
        dispatch(fetchMemberships())
        redirect ? history.replace(redirect) : history.replace('/landing')
      } else if (authSubmit.rejected.match(resultAction)) {
        const serverErrors = resultAction.payload
        if (serverErrors) {
          if (hasFormFeedback(serverErrors, authFormData)) {
            addServerErrors<AuthFormData>(serverErrors, setError)
          } else {
            setGenericError('Unable to authenticate')
          }
          return
        }
        setGenericError('Unable to authenticate')
      }
    }
  }

  return (
    <>
      {genericError && <Alert variant="danger"> {genericError} </Alert>}
      {type === AuthFormType.SIGNUP && (
        <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
          Already have an account?{' '}
          <Link
            to={{
              pathname: '/login',
              state: {
                background: {
                  pathname: upOnePath(urlLocation.pathname),
                },
              },
            }}
          >
            Log in
          </Link>
        </div>
      )}
      <Form>
        <Form.Group controlId="email">
          <Form.Label>Email</Form.Label>
          <Controller
            as={<Form.Control />}
            control={control}
            name="email"
            placeholder="Enter email"
            autoComplete="off"
            isInvalid={!!errors.email}
            defaultValue=""
          />
          <Form.Control.Feedback
            style={{ whiteSpace: 'pre-wrap' }}
            type="invalid"
          >
            {errors.email?.message}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="password">
          <Form.Label>Password</Form.Label>
          <Controller
            as={<Form.Control />}
            control={control}
            name="password"
            type="password"
            placeholder="Enter password"
            isInvalid={!!errors.password}
            defaultValue=""
          />
          {type === AuthFormType.SIGNUP ? (
            <Form.Text id="passwordHelpBlock" muted>
              Your password must be 8 characters long.
            </Form.Text>
          ) : (
            <LinkContainer
              to="/reset-password"
              style={{ padding: '0', float: 'right', marginBottom: '1rem' }}
            >
              <Button variant="link">Forgot password</Button>
            </LinkContainer>
          )}
          <Form.Control.Feedback
            style={{ whiteSpace: 'pre-wrap' }}
            type="invalid"
          >
            {errors.password?.message}
          </Form.Control.Feedback>
        </Form.Group>
        <LoadingButton
          loading={formState.isSubmitting}
          block
          onClick={async () => {
            const isValid = await trigger()
            if (!isValid) {
              return
            }
            grecaptcha.ready(async () => {
              try {
                const token = await grecaptcha.execute(captchaSiteKey(), {
                  action: `${type.toString().toLowerCase()}_submit`,
                })
                handleSubmit(generateSubmit(token))()
              } catch (err: any) {
                setGenericError('Unable to authenticate')
              }
            })
          }}
        >
          Continue
        </LoadingButton>
      </Form>
      <OrSeparator />
      <div style={{ position: 'relative' }}>
        <LoadingButton
          loading={googleLoading}
          onClick={() => {
            setGoogleLoading(true)
            window.location.replace(googleAuthLink)
          }}
          style={{ marginBottom: '1rem' }}
          variant="outline-secondary"
          block
        >
          <GoogleLogo />
          Continue with Google
        </LoadingButton>
      </div>
      <div
        style={{
          color: '#6c757d',
        }}
      >
        <small>
          {type === AuthFormType.SIGNUP && (
            <>
              By creating an account, you agree to the{' '}
              <Link to="/terms" target="_blank">
                Terms of Service
              </Link>
              .<br />
            </>
          )}
          This site is protected by reCAPTCHA and the Google{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>{' '}
          and{' '}
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </a>{' '}
          apply.
        </small>
      </div>
    </>
  )
}

export default AuthForm
