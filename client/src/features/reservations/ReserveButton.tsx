import CSS from 'csstype'
import React from 'react'
import { Button } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { useLocation } from 'react-router-dom'
import ReserveInitialState from './reservemodal/ReserveInitialState'

interface ReserveButtonProps {
  state?: ReserveInitialState
  style?: CSS.Properties
}

const ReserveButton = ({ state, style }: ReserveButtonProps) => {
  const urlLocation = useLocation()

  return (
    <LinkContainer
      style={style}
      to={{
        pathname: `${urlLocation.pathname}/reserve`,
        state: state,
      }}
    >
      <Button>Reserve</Button>
    </LinkContainer>
  )
}

export default ReserveButton
