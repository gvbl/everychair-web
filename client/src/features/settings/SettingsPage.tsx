import React, { useEffect, useRef } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '../..'
import RelativeSpinner from '../../components/RelativeSpinner'
import StopError from '../../components/StopError'
import { Role } from '../../models/api/Role'
import User from '../../models/api/User'
import { Loading, isLoading } from '../../models/Loading'
import { RootState } from '../../store'
import { fetchMembers } from '../members/membersSlice'
import BillingSection from './BillingSection'
import DeleteAccountSection from './DeleteAccountSection'
import MembershipsSection from './MembershipsSection'
import ProfileSection from './ProfileSection'

interface SettingsPageSelected {
  user?: User
  isMember: boolean
  isOwner: boolean
  membersLoading: Loading
}

const SettingsPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const organizationIds = useRef<string[]>([])

  useEffect(() => {
    dispatch(fetchMembers(organizationIds.current))
  }, [organizationIds, dispatch])

  const { user, isMember, isOwner, membersLoading } = useSelector<
    RootState,
    SettingsPageSelected
  >((state) => {
    organizationIds.current = Object.keys(state.memberships.entity)
    return {
      user: state.user.entity,
      isMember: Object.values(state.memberships.entity).length > 0,
      isOwner:
        Object.values(state.memberships.entity).filter((membership) =>
          membership.roles.includes(Role.OWNER)
        ).length > 0,
      membersLoading: state.members.loading,
    }
  })

  if (isLoading(membersLoading)) {
    return <RelativeSpinner />
  }

  if (membersLoading === Loading.FAILED) {
    return <StopError />
  }

  if (!user) {
    return null
  }

  return (
    <div
      className="d-flex h-100 justify-content-center"
      style={{ overflowY: 'auto' }}
    >
      <Container>
        <Row>
          <Col>
            <ProfileSection user={user} />
          </Col>
        </Row>
        {isMember && (
          <Row>
            <Col>
              <MembershipsSection />
            </Col>
          </Row>
        )}
        {isOwner && (
          <Row>
            <Col>
              <BillingSection />
            </Col>
          </Row>
        )}
        <Row>
          <Col>
            <DeleteAccountSection />
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default SettingsPage
