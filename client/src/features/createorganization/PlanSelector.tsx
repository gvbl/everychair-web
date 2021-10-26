import React from 'react'
import { ListGroup } from 'react-bootstrap'
import { Plan } from '../../models/api/Plan'
import { PlanToDetailsMap } from '../../models/api/PlanInfo'
import { isSmallScreen } from '../../models/mediaQueries'
import PlanSelectorItem from './PlanSelectorItem'

interface PlanSelectorProps {
  onChange: (plan: Plan) => void
  value: Plan
  disableFree: boolean
}

const PlanSelector = ({ onChange, value, disableFree }: PlanSelectorProps) => {
  const renderedDetailsLeft = PlanToDetailsMap[value]
    .slice(0, 3)
    .map((details, index) => (
      <li key={`plan-details-left-${index}`}>{details}</li>
    ))
  const renderedDetailsRight = PlanToDetailsMap[value]
    .slice(3)
    .map((details, index) => (
      <li key={`plan-details-right-${index}`}>{details}</li>
    ))

  const width = isSmallScreen() ? '8.5rem' : '5.75rem'
  return (
    <div>
      <ListGroup
        className="flex-wrap"
        style={{
          display: 'grid',
          justifyItems: 'center',
          columnGap: '0.25rem',
          rowGap: '0.25rem',
          gridTemplateColumns: `repeat(auto-fill, minmax(${width}, 1fr))`,
          overflowY: 'auto',
        }}
      >
        <PlanSelectorItem
          plan={Plan.FREE}
          active={value === Plan.FREE}
          disabled={disableFree}
          onClick={onChange}
        />
        <PlanSelectorItem
          plan={Plan.STARTER}
          active={value === Plan.STARTER}
          onClick={onChange}
        />
        <PlanSelectorItem
          plan={Plan.PROFESSIONAL}
          active={value === Plan.PROFESSIONAL}
          onClick={onChange}
        />
        <PlanSelectorItem
          plan={Plan.ENTERPRISE}
          active={value === Plan.ENTERPRISE}
          onClick={onChange}
        />
      </ListGroup>
      <div className="d-flex flex-column">
        <div style={{ marginLeft: '0.5rem', marginTop: '0.5rem' }}>Details</div>
        <div className="d-flex">
          <ul
            style={{
              marginTop: '0.25rem',
              paddingLeft: '1.75rem',
            }}
          >
            {renderedDetailsLeft}
          </ul>
          <ul
            style={{
              marginTop: '0.25rem',
              paddingLeft: '1.75rem',
            }}
          >
            {renderedDetailsRight}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default PlanSelector
