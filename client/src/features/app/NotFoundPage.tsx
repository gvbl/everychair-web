import React from 'react'
import { Container, Jumbotron } from 'react-bootstrap'

const NotFoundPage = () => {
  return (
    <Container>
      <Jumbotron fluid>
        <h1>404</h1>
        <p>The requested URL was not found.</p>
      </Jumbotron>
    </Container>
  )
}

export default NotFoundPage
