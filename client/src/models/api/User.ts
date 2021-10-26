export enum AuthStrategy {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
}

export default interface User {
  id: string
  email: string
  emailConfirmed: boolean
  authStrategy: AuthStrategy
  firstName?: string
  lastName?: string
  avatarUrl?: string
}
