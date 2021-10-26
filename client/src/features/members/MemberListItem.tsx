import React from 'react'
import { Badge, ListGroup } from 'react-bootstrap'
import { PersonFill } from 'react-bootstrap-icons'
import { useHistory, useParams } from 'react-router-dom'
import { Shape } from '../../components/HiddenAltImage'
import IconAltImage from '../../components/IconAltImage'
import Member from '../../models/api/Member'
import { Role } from '../../models/api/Role'
import { MemberParams } from '../../models/MemberParams'
import { formatNameOrAlternate } from '../../util/text'

interface MembersListItemProps {
  member: Member
}

const MembersListItem = ({ member }: MembersListItemProps) => {
  const { organizationId, membershipId } = useParams<MemberParams>()
  const history = useHistory()

  return (
    <ListGroup.Item
      as="li"
      className="d-flex"
      action
      active={member.membershipId === membershipId}
      style={{ cursor: 'pointer' }}
      variant="light"
      onClick={() =>
        history.push(
          `/manage/organizations/${organizationId}/members/${member.membershipId}`
        )
      }
    >
      <div className="d-flex align-items-center" style={{ flexGrow: 1 }}>
        <IconAltImage
          title="Avatar"
          src={member.avatarUrl}
          width="2rem"
          height="2rem"
          icon={<PersonFill color="white" size={20} />}
          shape={Shape.RoundedCircle}
        />
        <span style={{ marginLeft: '1rem' }}>
          {formatNameOrAlternate(
            member.email,
            member.firstName,
            member.lastName
          )}
        </span>
      </div>
      <div className="d-flex align-items-center">
        {member.roles.includes(Role.OWNER) && (
          <Badge style={{ alignSelf: 'center' }} variant="warning">
            Owner
          </Badge>
        )}
        {member.roles.includes(Role.ADMIN) && (
          <Badge
            style={{ alignSelf: 'center', marginLeft: '0.5rem' }}
            variant="info"
          >
            Admin
          </Badge>
        )}
        {member.roles.includes(Role.CLEANING) && (
          <Badge
            style={{ alignSelf: 'center', marginLeft: '0.5rem' }}
            variant="success"
          >
            Cleaning
          </Badge>
        )}
      </div>
    </ListGroup.Item>
  )
}

export default MembersListItem
