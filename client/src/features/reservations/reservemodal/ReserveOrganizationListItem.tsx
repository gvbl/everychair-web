import React from 'react'
import { Badge, ListGroup } from 'react-bootstrap'
import { ExclamationTriangle } from 'react-bootstrap-icons'
import Organization from '../../../models/api/Organization'
import { SubscriptionStatus } from '../../../models/api/SubscriptionStatus'

interface ReserveOrganizationListItemProps {
  organization: Organization
  deskCount: number
  onClick?: (organizationId: string) => void
}

const ReserveOrganizationListItem = ({
  organization,
  deskCount,
  onClick,
}: ReserveOrganizationListItemProps) => {
  const isPaymentFailed =
    organization.subscription?.status === SubscriptionStatus.PAYMENT_FAILED

  return (
    <ListGroup.Item
      as="li"
      className="d-flex"
      disabled={deskCount === 0 || isPaymentFailed}
      action
      style={{ cursor: 'pointer', justifyContent: 'space-between' }}
      variant="light"
      onClick={() => {
        if (onClick) {
          onClick(organization.id)
        }
      }}
    >
      <div className={deskCount === 0 ? 'disabled' : undefined}>
        {organization.name}
        {isPaymentFailed && (
          <ExclamationTriangle
            color="black"
            size={18}
            style={{ marginLeft: '0.5rem', marginTop: '-0.25rem' }}
          />
        )}
      </div>
      <Badge
        style={{ alignSelf: 'center' }}
        variant={deskCount === 0 || isPaymentFailed ? 'secondary' : 'primary'}
      >
        {deskCount}
      </Badge>
    </ListGroup.Item>
  )
}

export default ReserveOrganizationListItem
