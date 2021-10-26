import CSS from 'csstype'
import React from 'react'
import { Button, Dropdown } from 'react-bootstrap'

interface CustomToggleProps {
  onClick: (event: React.MouseEvent<HTMLElement>) => void
}

const CustomToggle = React.forwardRef<HTMLDivElement, CustomToggleProps>(
  ({ onClick }: CustomToggleProps, ref) => (
    <div ref={ref} className="d-flex align-items-center">
      <Button
        variant="light"
        onClick={(event) => {
          event.preventDefault()
          onClick(event)
        }}
        style={{ padding: '0 0.25rem' }}
      >
        <div style={{ marginTop: '-0.5rem' }}>
          <b>…</b>
        </div>
      </Button>
    </div>
  )
)

interface DeskEditMenuProps {
  style?: CSS.Properties
  onDelete: () => void
}

const DeskEditMenu = ({ style, onDelete }: DeskEditMenuProps) => {
  return (
    <div style={style}>
      <Dropdown>
        <Dropdown.Toggle as={CustomToggle} />
        <Dropdown.Menu>
          <Dropdown.Item onClick={onDelete}>Delete</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  )
}

export default DeskEditMenu
