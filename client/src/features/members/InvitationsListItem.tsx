import React, { useEffect } from 'react'
import { ListGroup } from 'react-bootstrap'
import { useHistory, useParams } from 'react-router-dom'
import Invitation from '../../models/api/Invitation'
import { InvitationParams } from '../../models/InvitationParams'
import { isVisible } from '../../util/util'

interface InvitationsListItemProps {
  invitation: Invitation
}

const InvitationsListItem = ({ invitation }: InvitationsListItemProps) => {
  const { organizationId, invitationId } = useParams<InvitationParams>()
  const history = useHistory()
  const itemRef = React.useRef<HTMLLIElement>(null)

  const isActive = invitation.id === invitationId
  useEffect(() => {
    if (!itemRef.current) {
      return
    }
    if (isActive && !isVisible(itemRef.current)) {
      itemRef.current.scrollIntoView({ block: 'nearest' })
    }
  }, [itemRef, isActive])

  return (
    <ListGroup.Item
      as="li"
      ref={itemRef}
      action
      active={isActive}
      style={{ cursor: 'pointer' }}
      variant="light"
      onClick={() =>
        history.push(
          `/manage/organizations/${organizationId}/members/invitations/${invitation.id}`
        )
      }
    >
      {invitation.email}
    </ListGroup.Item>
  )
}

export default InvitationsListItem
