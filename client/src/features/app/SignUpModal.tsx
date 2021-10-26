import React from 'react'
import GenericModal from '../../components/modals/GenericModal'
import { useQuery } from '../../util/query'
import { SignUpForm } from './AuthForm'

interface SignUpModalProps {
  origin: string
}

const SignUpModal = ({ origin }: SignUpModalProps) => {
  const planQueryParam = useQuery().get('plan')

  return (
    <GenericModal title="Sign up" show>
      <SignUpForm
        origin={origin}
        redirect={
          planQueryParam
            ? `/start/create-organization?plan=${planQueryParam}`
            : undefined
        }
      />
    </GenericModal>
  )
}

export default SignUpModal
