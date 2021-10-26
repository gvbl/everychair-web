import axios from 'axios'
import { capitalize } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import { Alert, Button, Container, Spinner, Table } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { LinkContainer } from 'react-router-bootstrap'
import { Link, useLocation, useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import HiddenAltImage from '../../components/HiddenAltImage'
import CustomerPortal from '../../models/api/CustomerPortal'
import Organization from '../../models/api/Organization'
import { Plan } from '../../models/api/Plan'
import { SubscriptionStatus } from '../../models/api/SubscriptionStatus'
import { OrganizationParams } from '../../models/OrganizationParams'
import { RootState } from '../../store'
import { useQuery } from '../../util/query'
import { linkDomain } from '../../util/util'
import { refreshPlanSubscription } from '../app/membershipsSlice'

const OrganizationPage = () => {
  const { organizationId } = useParams<OrganizationParams>()
  const success = useQuery().get('success')
  const urlLocation = useLocation()
  const dispatch = useDispatch<AppDispatch>()
  const refCurrentOrganizationId = useRef(organizationId)

  const [genericError, setGenericError] = useState<string | null>()
  const [genericSuccess, setGenericSuccess] = useState<string | null>()

  useEffect(() => {
    if (refCurrentOrganizationId.current !== organizationId) {
      setGenericError(null)
      setGenericSuccess(null)
      refCurrentOrganizationId.current = organizationId
    }
  }, [organizationId, refCurrentOrganizationId])

  useEffect(() => {
    if (success) {
      setGenericSuccess('Plan changed successfully.')
    }
  }, [urlLocation.search, success, setGenericSuccess])

  const forwardCustomerPortal = async () => {
    try {
      const { data } = await axios.post<CustomerPortal>(
        '/api/customer-portal-url',
        {
          returnUrl: `${linkDomain()}/manage/organizations/${organizationId}/organization`,
        }
      )
      window.location.href = data.url
    } catch (err: any) {
      setGenericError('Unable to access customer portal')
    }
  }

  const organization = useSelector<RootState, Organization | undefined>(
    (state) => state.memberships.entity[organizationId]?.organization
  )

  if (!organization) {
    return null
  }

  const refreshPending = async () => {
    setGenericError(null)
    const resultAction = await dispatch(refreshPlanSubscription(organizationId))
    if (!refreshPlanSubscription.fulfilled.match(resultAction)) {
      setGenericError('Unable to refresh')
    }
  }

  return (
    <div className="h-100 w-100" style={{ overflowY: 'auto' }}>
      <Container style={{ padding: '0' }}>
        <div style={{ marginTop: '2rem' }}>
          {genericError && <Alert variant="danger"> {genericError} </Alert>}
          {genericSuccess && (
            <Alert variant="success"> {genericSuccess} </Alert>
          )}
        </div>
        <Table className="table-borderless">
          <tbody>
            <tr className="table-separator">
              <td colSpan={2} className="first-column">
                <b>Organization name</b>
                <p>{organization.name}</p>
              </td>
              <td className="text-right">
                <Link to={`${urlLocation.pathname}/edit-organization-name`}>
                  Edit
                </Link>
              </td>
            </tr>
            <tr className="table-separator">
              <td colSpan={2} className="first-column">
                <b>Icon</b>
                {organization.iconUrl ? (
                  <div style={{ marginTop: '0.5rem' }}>
                    <HiddenAltImage
                      title="Organization Icon"
                      src={organization.iconUrl}
                      width="5rem"
                      height="5rem"
                    />
                  </div>
                ) : (
                  <p>None</p>
                )}
              </td>
              <td colSpan={2} className="text-right">
                <Link to={`${urlLocation.pathname}/edit-organization-icon`}>
                  Edit
                </Link>
                {organization.iconUrl && (
                  <>
                    <br />
                    <Link
                      to={`${urlLocation.pathname}/remove-organization-icon`}
                    >
                      Remove
                    </Link>
                  </>
                )}
              </td>
            </tr>
            <tr className="table-separator">
              <td colSpan={2} className="first-column">
                <b>Cleaning</b>
                <p>{organization.cleaning ? 'Enabled' : 'Disabled'}</p>
              </td>
              <td className="text-right">
                <Link to={`${urlLocation.pathname}/edit-cleaning`}>Edit</Link>
              </td>
            </tr>
            <tr>
              <td className="first-column">
                <b>Plan</b>
                <p>{capitalize(organization.plan)}</p>
              </td>
              <td style={{ verticalAlign: 'middle' }}>
                <div
                  className="text-center"
                  hidden={
                    organization.subscription?.status !==
                    SubscriptionStatus.PENDING
                  }
                >
                  <Spinner
                    style={{ marginRight: '0.5rem' }}
                    as="span"
                    animation="border"
                    size="sm"
                  />
                  Change pending
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={refreshPending}
                    style={{ marginLeft: '0.25rem' }}
                  >
                    Refresh
                  </Button>
                </div>
                <div
                  hidden={
                    organization.subscription?.status !==
                    SubscriptionStatus.PAYMENT_FAILED
                  }
                >
                  <div className="d-flex align-items-center">
                    <div
                      className="d-flex flex-column"
                      style={{ marginLeft: '1rem' }}
                    >
                      <b>There was an problem with your payment.</b>
                      Click the Manage Billing link to update your payment
                      method.
                    </div>
                  </div>
                </div>
              </td>
              <td className="text-right">
                <LinkContainer
                  to={`/change-plan/${organization.id}`}
                  style={{ padding: '0' }}
                >
                  <Button
                    variant="link"
                    disabled={
                      organization.subscription?.status ===
                      SubscriptionStatus.PENDING
                    }
                  >
                    Change
                  </Button>
                </LinkContainer>
                <br />
                <Button
                  variant="link"
                  hidden={organization.plan === Plan.FREE}
                  onClick={forwardCustomerPortal}
                  style={{ padding: '0' }}
                >
                  Manage Billing
                </Button>
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="text-center">
                <LinkContainer
                  to={`${urlLocation.pathname}/delete-organization`}
                >
                  <Button variant="danger">Delete organization</Button>
                </LinkContainer>
              </td>
            </tr>
          </tbody>
        </Table>
      </Container>
    </div>
  )
}

export default OrganizationPage
