import React from 'react'
import { Button, Card, Col, Container, Row } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { useLocation } from 'react-router-dom'
import { isSmallScreen } from '../../models/mediaQueries'

const StartPage = () => {
  const urlLocation = useLocation()

  return (
    <div className="h-100" style={{ overflowY: 'auto' }}>
      <Container className="h-100">
        <Row className="h-100">
          <Col
            className="d-flex justify-content-center align-items-center"
            md
            style={{ padding: '1rem' }}
          >
            <Card
              style={
                isSmallScreen()
                  ? { width: '22rem', height: '10rem' }
                  : { width: '22rem', height: '20rem' }
              }
            >
              <Card.Body>
                <Card.Title>Join your team</Card.Title>
                <Card.Text>
                  Ask your administrator for an invititation.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col
            className="d-flex justify-content-center align-items-center"
            md
            style={{ padding: '1rem' }}
          >
            <Card style={{ width: '22rem', height: '20rem' }}>
              <Card.Body>
                <Card.Title>Administrator</Card.Title>
                <Card.Text>Set up Everychair for your organization.</Card.Text>
              </Card.Body>
              <Card.Footer className="text-center">
                <LinkContainer
                  to={`${urlLocation.pathname}/create-organization`}
                >
                  <Button>Create organization</Button>
                </LinkContainer>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default StartPage
