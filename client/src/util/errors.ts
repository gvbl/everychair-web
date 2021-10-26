export interface ValidationError {
  value?: string
  msg: string
  param: string
}

export interface ErrorResponse {
  errors: ValidationError[]
}

export const firstError = (
  errors: ValidationError[],
  field: string
): string | undefined => {
  const filtered = errors.filter((error: ValidationError) => {
    return error.param === field
  })
  return filtered.length > 0 ? filtered[0].msg : undefined
}

export const firstErrorArray = (
  errors: ValidationError[],
  field: string
): string | undefined => {
  const filtered = errors.filter((error: ValidationError) => {
    return error.param.includes(field)
  })
  return filtered.length > 0
    ? filtered[0].msg + ': ' + filtered[0].value
    : undefined
}

export const addServerErrors = <T>(
  serverErrors: ValidationError[],
  setError: (
    fieldName: keyof T,
    error: { type: string; message: string }
  ) => void
) => {
  serverErrors.forEach((serverError) => {
    setError(serverError.param as keyof T, {
      type: 'server',
      message: serverError.msg,
    })
  })
}

export const hasFormFeedback = (
  serverErrors: ValidationError[],
  formData: object
) => {
  const params = serverErrors.map((serverError) => serverError.param)
  const formFields = Object.keys(formData)
  for (let i = 0; i < params.length; i++) {
    if (formFields.includes(params[i])) {
      return true
    }
  }
  return false
}
