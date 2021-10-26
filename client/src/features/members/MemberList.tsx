import React from 'react'
import Member from '../../models/api/Member'
import MemberListItem from './MemberListItem'

interface MemberListProps {
  members: Member[]
}

const MemberList = ({ members }: MemberListProps) => {
  const renderedMembers = members.map((member) => (
    <MemberListItem member={member} key={member.membershipId} />
  ))

  return <>{renderedMembers}</>
}

export default MemberList
