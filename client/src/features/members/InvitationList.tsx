import React from 'react'
import Invitation from '../../models/api/Invitation'
import InvitationListItem from './InvitationsListItem'

interface InvitationsListProps {
  invitations: Invitation[]
}

const InvitationList = ({ invitations }: InvitationsListProps) => {
  const renderedInvitations = invitations.map((invitation) => (
    <InvitationListItem invitation={invitation} key={invitation.id} />
  ))

  return <>{renderedInvitations}</>
}

export default InvitationList
