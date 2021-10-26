import React from 'react'
import { PersonFill } from 'react-bootstrap-icons'
import { useSelector } from 'react-redux'
import { Shape } from '../../components/HiddenAltImage'
import IconAltImage from '../../components/IconAltImage'
import Member from '../../models/api/Member'
import { RootState } from '../../store'
import { formatNameOrAlternate, formatTimeRange } from '../../util/text'
import ReservationDay from '../reservations/ReservationDay'

interface MemberDeskTimeProps {
  reservationDay: ReservationDay
}

const MemberDeskTimeListItem = ({ reservationDay }: MemberDeskTimeProps) => {
  const member = useSelector<RootState, Member>(
    (state) => state.members.entity[reservationDay.membershipId]
  )

  return (
    <div className="d-flex align-items-center" style={{ flexGrow: 1 }}>
      <IconAltImage
        title="Avatar"
        src={member.avatarUrl}
        width="2.75rem"
        height="2.75rem"
        icon={<PersonFill color="white" size={20} />}
        shape={Shape.RoundedCircle}
      />
      <div className="text-contained" style={{ marginLeft: '0.5rem' }}>
        {formatNameOrAlternate(member.email, member.firstName, member.lastName)}
        <br />
        <small>{formatTimeRange(reservationDay.timeRange)}</small>
      </div>
    </div>
  )
}

export default MemberDeskTimeListItem
