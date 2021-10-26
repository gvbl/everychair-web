import React from 'react'
import {
  Badge,
  Button,
  Col,
  Container,
  ListGroup,
  Row,
  Table,
} from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { LinkContainer } from 'react-router-bootstrap'
import { useLocation } from 'react-router-dom'
import HiddenAltImage from '../../components/HiddenAltImage'
import Membership from '../../models/api/Membership'
import { Role } from '../../models/api/Role'
import { RootState } from '../../store'

interface MembershipsSelected {
  memberships: Membership[]
}

const MembershipsSection = () => {
  const urlLocation = useLocation()

  const { memberships } = useSelector<RootState, MembershipsSelected>(
    (state) => {
      return {
        memberships: Object.values(state.memberships.entity),
      }
    }
  )

  const renderedMemberships = memberships.map((membership) => {
    const organization = membership.organization
    return (
      <ListGroup.Item
        as="li"
        className="d-flex align-items-center"
        key={organization.id}
      >
        <HiddenAltImage
          title="Organization Icon"
          src={organization.iconUrl}
          width="2rem"
          height="2rem"
          style={organization.iconUrl ? { marginRight: '1rem' } : {}}
        />
        <div style={{ flexGrow: 1 }}>{organization.name}</div>
        <div>
          {membership.roles.includes(Role.OWNER) && (
            <Badge variant="warning">Owner</Badge>
          )}
          {membership.roles.includes(Role.ADMIN) && (
            <Badge style={{ marginLeft: '0.5rem' }} variant="info">
              Admin
            </Badge>
          )}
          {membership.roles.includes(Role.CLEANING) && (
            <Badge style={{ marginLeft: '0.5rem' }} variant="success">
              Cleaning
            </Badge>
          )}
        </div>
      </ListGroup.Item>
    )
  })

  return (
    <Table className="table-borderless">
      <tbody>
        <tr>
          <td>
            <h3>Memberships</h3>
          </td>
        </tr>
        <tr>
          <td>
            <Container style={{ padding: '0' }}>
              <Row>
                <Col md>
                  <ListGroup style={{ flexGrow: 1 }}>
                    {renderedMemberships}
                  </ListGroup>
                </Col>
                <Col
                  className="d-flex justify-content-center align-items-center"
                  md
                >
                  <LinkContainer
                    to={`${urlLocation.pathname}/create-organization`}
                  >
                    <Button>Create organization</Button>
                  </LinkContainer>
                </Col>
              </Row>
            </Container>
          </td>
        </tr>
      </tbody>
    </Table>
  )
}

export default MembershipsSection
