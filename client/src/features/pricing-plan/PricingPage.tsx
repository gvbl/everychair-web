import React from 'react'
import { Container, Jumbotron } from 'react-bootstrap'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { Plan } from '../../models/api/Plan'
import { isSmallScreen } from '../../models/mediaQueries'
import ProductCard from './ProductCard'

const PricingPage = () => {
  const history = useHistory()
  const urlLocation = useLocation()

  const handleChange = async (plan: Plan) => {
    history.push(`/pricing/signup?plan=${plan}`)
  }

  return (
    <>
      <div className="h-100" style={{ overflowY: 'auto' }}>
        <h1
          style={
            isSmallScreen()
              ? { textAlign: 'center', margin: '2rem' }
              : { textAlign: 'center', margin: '4rem' }
          }
        >
          Pricing
        </h1>
        <Container>
          <Jumbotron>
            <p>
              If your organization already has Everychair,{' '}
              <Link to={`${urlLocation.pathname}/signup`}>sign up</Link> for
              free and join your team.
            </p>
            <p>
              Just getting started? Everychair is free for small teams! Find a
              plan below that matches the scale of your organization.
            </p>
          </Jumbotron>
          <div
            style={{
              display: 'grid',
              justifyItems: 'center',
              columnGap: '0.5rem',
              rowGap: '1.5rem',
              gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
            }}
          >
            <ProductCard
              onChange={handleChange}
              plan={Plan.FREE}
              changeText="Sign up for free"
            />
            <ProductCard
              onChange={handleChange}
              plan={Plan.STARTER}
              changeText="Get started"
            />
            <ProductCard
              onChange={handleChange}
              plan={Plan.PROFESSIONAL}
              changeText="Get started"
            />
            <ProductCard
              onChange={handleChange}
              plan={Plan.ENTERPRISE}
              changeText="Get started"
            />
          </div>
          <div className="text-center" style={{ marginTop: '1rem' }}>
            Plans billed monthly, cancel anytime.
          </div>
        </Container>
      </div>
    </>
  )
}

export default PricingPage
