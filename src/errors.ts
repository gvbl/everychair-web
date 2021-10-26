export interface ParamErrors {
  errors: ParamError[]
}

export interface ParamError {
  msg: string
  param: string
}

export const oneParamError = (msg: string, param: string): ParamErrors => {
  return {
    errors: [
      {
        msg: msg,
        param: param,
      },
    ],
  }
}

export const USER_NOT_FOUND_ERROR = new Error('user not found')
