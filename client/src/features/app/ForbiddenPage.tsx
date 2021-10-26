import React from 'react'
import { Button } from 'react-bootstrap'
import { Container, Jumbotron } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { useLocation } from 'react-router-dom'

const ForbiddenPage = () => {
  let urlLocation = useLocation()

  return (
    <Container>
      <Jumbotron fluid>
        <h1>Forbidden</h1>
        <p>You must be logged in to view this page.</p>
        <p>
          <LinkContainer to={`${urlLocation.pathname}/login`}>
            <Button>Log in</Button>
          </LinkContainer>
        </p>
      </Jumbotron>
    </Container>
  )
}

export default ForbiddenPage
