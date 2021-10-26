import { capitalize } from 'lodash'
import React, { useEffect, useState } from 'react'
import { Alert, Button, Card } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { LinkContainer } from 'react-router-bootstrap'
import { useLocation, useParams } from 'react-router-dom'
import Center from '../../components/Center'
import { Plan } from '../../models/api/Plan'
import { OrganizationParams } from '../../models/OrganizationParams'
import { RootState } from '../../store'
import { useQuery } from '../../util/query'

interface CreatedOrganizationPageSelected {
  name: string
  plan: Plan
}

const OrganizationWelcome = () => {
  const { organizationId } = useParams<OrganizationParams>()
  const error = useQuery().get('error')
  const warning = useQuery().get('warning')
  const planQueryParam = useQuery().get('plan')
  const urlLocation = useLocation()

  const [genericError, setGenericError] = useState<string | null>()
  const [genericWarning, setGenericWarning] = useState<string | null>()

  useEffect(() => {
    if (error && planQueryParam) {
      setGenericError(
        `Unable to start ${capitalize(
          planQueryParam
        )} plan subscription, defaulting to Free. Please try again later.`
      )
    }
    if (warning && planQueryParam) {
      setGenericWarning(
        `Checkout cancelled for ${capitalize(
          planQueryParam
        )} plan subscription, defaulting to Free. Please try again later.`
      )
    }
  }, [
    urlLocation.search,
    planQueryParam,
    error,
    warning,
    setGenericError,
    setGenericWarning,
  ])

  const { name, plan } = useSelector<
    RootState,
    CreatedOrganizationPageSelected
  >((state) => {
    return {
      name: state.memberships.entity[organizationId]?.organization.name,
      plan: state.memberships.entity[organizationId]?.organization.plan,
    }
  })

  if (!name || !plan) {
    return null
  }

  return (
    <Center>
      {genericError && <Alert variant="danger">{genericError}</Alert>}
      {genericWarning && <Alert variant="warning">{genericWarning}</Alert>}
      <Card>
        <Card.Body style={{ display: 'inline' }}>
          <Card.Title>Organization created</Card.Title>
          <Card.Text>
            Your organization <b>{name}</b> has been created and is subscribed
            to the {capitalize(plan)} plan. Get started by navigating to the
            Manage console to setup desks and invite members.
          </Card.Text>
          <LinkContainer to={`/manage/organizations/${organizationId}/members`}>
            <Button>Manage</Button>
          </LinkContainer>
        </Card.Body>
      </Card>
    </Center>
  )
}

export default OrganizationWelcome
