import React from 'react'
import { Container, Jumbotron } from 'react-bootstrap'

const UnauthorizedPage = () => {
  return (
    <Container>
      <Jumbotron fluid>
        <h1>Unauthorized</h1>
        <p>You are not authorized view this page.</p>
      </Jumbotron>
    </Container>
  )
}

export default UnauthorizedPage
