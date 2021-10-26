import React, { useState } from 'react'
import { Button, Collapse, Container, Jumbotron } from 'react-bootstrap'

interface StopErrorProps {
  title?: string
  details?: string
}

const StopError = ({
  title = 'Something went wrong',
  details,
}: StopErrorProps) => {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <Container>
      <Jumbotron fluid>
        <h1>{title}</h1>
        <br />
        <Button
          variant="danger"
          onClick={() => setShowDetails(!showDetails)}
          hidden={!details}
        >
          Details
        </Button>
        <Collapse in={showDetails}>
          <div>
            <br />
            <p style={{ whiteSpace: 'pre-line' }}>{details}</p>
          </div>
        </Collapse>
      </Jumbotron>
    </Container>
  )
}

export default StopError
