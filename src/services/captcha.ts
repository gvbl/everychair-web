import axios from 'axios'
import * as keys from './config/keys'

interface VerifyCaptchaResponse {
  success: boolean
  score: number
  action: string
}

export const verifyCaptcha = async (
  action: string,
  captcha: string,
  ip: string
) => {
  const { data } = await axios.post<VerifyCaptchaResponse>(
    `https://www.google.com/recaptcha/api/siteverify?secret=${keys.CAPTCHA_SECRET_KEY}&response=${captcha}&remoteip=${ip}`
  )

  if (!data.success || data.action !== action) {
    return false
  }

  return data.score >= 0.5
}
