import React, { useEffect, useRef } from 'react'
import { Button, Container, Table } from 'react-bootstrap'
import { PersonFill } from 'react-bootstrap-icons'
import { useDispatch, useSelector } from 'react-redux'
import { LinkContainer } from 'react-router-bootstrap'
import { Link, useLocation, useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import RelativeSpinner from '../../components/RelativeSpinner'
import { Shape } from '../../components/HiddenAltImage'
import IconAltImage from '../../components/IconAltImage'
import StopError from '../../components/StopError'
import Member from '../../models/api/Member'
import { Role } from '../../models/api/Role'
import { isLoading, Loading } from '../../models/Loading'
import { MemberParams } from '../../models/MemberParams'
import { RootState } from '../../store'
import { fetchMembers } from './membersSlice'
import { capitalize } from 'lodash'
import { formatNameOrAlternate } from '../../util/text'

interface MemberDetailInnerProps {
  member: Member
}

const MemberDetailInner = ({ member }: MemberDetailInnerProps) => {
  const urlLocation = useLocation()

  const isSelf = useSelector<RootState, boolean>(
    (state) => state.user.entity?.id === member.userId
  )

  if (!member) {
    return null
  }

  const roles = [...member.roles]
  const formattedRoles = roles.sort().map((role) => {
    return capitalize(role)
  })

  return (
    <div className="h-100 w-100" style={{ overflowY: 'auto' }}>
      <Container style={{ padding: '0' }}>
        <Table className="table-borderless">
          <tbody>
            <tr>
              <td colSpan={2}>
                <div className="d-flex align-items-center">
                  <IconAltImage
                    title="Avatar"
                    src={member.avatarUrl}
                    width="5rem"
                    height="5rem"
                    icon={<PersonFill color="white" size={50} />}
                    shape={Shape.RoundedCircle}
                  />
                  <h3 style={{ marginLeft: '1rem' }}>
                    {formatNameOrAlternate(
                      '',
                      member.firstName,
                      member.lastName
                    )}
                  </h3>
                </div>
              </td>
            </tr>
            <tr className="table-separator">
              <td colSpan={2} className="first-column">
                <b>Email</b>
                <p>{member.email ?? 'Not provided'}</p>
              </td>
            </tr>
            <tr className="table-separator">
              <td colSpan={2} className="first-column">
                <b>Name</b>
                <p>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: formatNameOrAlternate(
                        '<i>Not provided<i/>',
                        member.firstName,
                        member.lastName
                      ),
                    }}
                  />
                </p>
              </td>
            </tr>
            <tr>
              <td className="first-column">
                <b>Roles</b>
                <p>{formattedRoles.join(', ')}</p>
              </td>
              <td className="text-right">
                <Link to={`${urlLocation.pathname}/edit-roles`}>Edit</Link>
              </td>
            </tr>
            <tr hidden={isSelf || member.roles.includes(Role.OWNER)}>
              <td className="text-center" colSpan={2}>
                <LinkContainer to={`${urlLocation.pathname}/remove-member`}>
                  <Button variant="danger">Remove member</Button>
                </LinkContainer>
              </td>
            </tr>
          </tbody>
        </Table>
      </Container>
    </div>
  )
}

interface MemberDetailSelected {
  membersLoading: Loading
  member?: Member
}

const MemberDetail = () => {
  const dispatch = useDispatch<AppDispatch>()
  const organizationIds = useRef<string[]>([])

  const { membershipId } = useParams<MemberParams>()
  const { membersLoading, member } = useSelector<
    RootState,
    MemberDetailSelected
  >((state) => {
    organizationIds.current = Object.keys(state.memberships.entity)
    return {
      membersLoading: state.members.loading,
      member: membershipId ? state.members.entity[membershipId] : undefined,
    }
  })

  useEffect(() => {
    dispatch(fetchMembers(organizationIds.current))
  }, [organizationIds, dispatch])

  if (isLoading(membersLoading)) {
    return <RelativeSpinner />
  }

  if (membersLoading === Loading.FAILED) {
    return <StopError />
  }

  return member ? <MemberDetailInner member={member} /> : null
}

export default MemberDetail
