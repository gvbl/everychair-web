export enum Loading {
  IDLE = 'IDLE',
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
}

export const isLoading = (loading: Loading) => {
  return loading === Loading.IDLE || loading === Loading.PENDING
}
