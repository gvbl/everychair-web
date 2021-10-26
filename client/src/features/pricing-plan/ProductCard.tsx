import { capitalize } from 'lodash'
import React from 'react'
import { Card, ListGroup } from 'react-bootstrap'
import LoadingButton from '../../components/LoadingButton'
import { Plan } from '../../models/api/Plan'
import {
  PlanToDetailsMap,
  PlanToDollarPriceMap,
} from '../../models/api/PlanInfo'

interface ProductProps {
  onChange: (plan: Plan) => Promise<void>
  plan: Plan
  changeText: string
  disabled?: boolean
  loading?: boolean
}

const ProductCard = ({
  onChange,
  plan,
  changeText,
  disabled,
  loading,
}: ProductProps) => {
  const renderedDetailsItems = PlanToDetailsMap[plan].map((detail) => (
    <ListGroup.Item key={detail} style={{ padding: '0', border: 'unset' }}>
      {detail}
    </ListGroup.Item>
  ))
  return (
    <Card style={{ width: '16rem', minWidth: '16rem', textAlign: 'center' }}>
      <Card.Header>
        <h4>{capitalize(plan)}</h4>
      </Card.Header>
      <Card.Body>
        <Card.Title>
          <h3 style={{ display: 'inline ' }}>{PlanToDollarPriceMap[plan]}</h3>
          <h4
            style={{
              display: 'inline ',
              marginLeft: '0.5rem',
              color: 'darkgray',
            }}
          >
            / mo
          </h4>
        </Card.Title>
        <ListGroup
          variant="flush"
          style={{ marginTop: '1rem', marginBottom: '2rem' }}
        >
          {renderedDetailsItems}
        </ListGroup>
        <LoadingButton
          loading={!!loading}
          disabled={disabled}
          onClick={async () => onChange(plan)}
        >
          {disabled ? 'Current plan' : changeText}
        </LoadingButton>
      </Card.Body>
    </Card>
  )
}

export default ProductCard
