import { capitalize } from 'lodash'
import React from 'react'
import { ListGroup, Card } from 'react-bootstrap'
import { Plan } from '../../models/api/Plan'
import { PlanToDollarPriceMap } from '../../models/api/PlanInfo'
import { isSmallScreen } from '../../models/mediaQueries'

interface PlanSelectorItemProps {
  plan: Plan
  active: boolean
  disabled?: boolean
  onClick: (plan: Plan) => void
}

const PlanSelectorItem = ({
  plan,
  active,
  disabled = false,
  onClick,
}: PlanSelectorItemProps) => {
  const width = isSmallScreen() ? '8.5rem' : '5.75rem'

  return (
    <ListGroup.Item
      as="div"
      action
      active={active}
      disabled={disabled}
      style={{
        cursor: 'pointer',
        padding: '0.25rem',
        margin: '0',
        width: 'auto',
        borderStyle: 'none',
        borderRadius: '0.25rem',
      }}
      variant="light"
    >
      <Card
        onClick={() => onClick(plan)}
        style={{
          width: width,
          padding: '0.25rem 0',
          backgroundColor: 'transparent',
        }}
      >
        <div className="d-flex flex-column text-center">
          <div>{capitalize(plan)}</div>
          <div style={{ marginTop: '0.5rem' }}>
            {PlanToDollarPriceMap[plan]}
            <small> / mo</small>
          </div>
        </div>
      </Card>
    </ListGroup.Item>
  )
}

export default PlanSelectorItem
