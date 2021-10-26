import React from 'react'
import { Button, Dropdown } from 'react-bootstrap'
import { ExclamationTriangle } from 'react-bootstrap-icons'
import HiddenAltImage from '../../components/HiddenAltImage'
import Organization from '../../models/api/Organization'
import { SubscriptionStatus } from '../../models/api/SubscriptionStatus'

interface CustomToggleProps {
  organization: Organization
  onClick: (event: React.MouseEvent<HTMLElement>) => void
}

const CustomToggle = React.forwardRef<HTMLDivElement, CustomToggleProps>(
  ({ organization, onClick }: CustomToggleProps, ref) => (
    <div ref={ref}>
      <Button
        variant="light"
        onClick={(event) => {
          event.preventDefault()
          onClick(event)
        }}
        style={{
          padding: '0.25rem 0.5rem',
        }}
      >
        <div className="d-flex align-items-center">
          <HiddenAltImage
            title="Organization Icon"
            src={organization.iconUrl}
            width="1.8rem"
            height="1.8rem"
            style={organization.iconUrl ? { marginRight: '1rem' } : {}}
          />
          <span style={{ fontSize: '1.25rem' }}>{organization.name}</span>
        </div>
      </Button>
    </div>
  )
)

interface ManageOrganizationsDropdownProps {
  manageOrganizationsMap: Record<string, Organization>
  onSelect?: (organizationId: string) => void
  selectedId?: string
}

const ManageOrganizationsDropdown = ({
  manageOrganizationsMap,
  onSelect,
  selectedId,
}: ManageOrganizationsDropdownProps) => {
  return (
    <Dropdown>
      {selectedId && manageOrganizationsMap[selectedId] && (
        <Dropdown.Toggle
          as={CustomToggle}
          organization={manageOrganizationsMap[selectedId]}
          id="admin-organizations-toggle"
        />
      )}
      {Object.values(manageOrganizationsMap).length > 1 && (
        <Dropdown.Menu>
          {Object.values(manageOrganizationsMap).map((manageOrganization) => {
            return (
              <Dropdown.Item
                className="d-flex align-items-center"
                key={manageOrganization.id}
                active={manageOrganization.id === selectedId}
                onClick={() => {
                  if (onSelect) {
                    onSelect(manageOrganization.id)
                  }
                }}
              >
                <HiddenAltImage
                  title="Icon"
                  src={manageOrganization.iconUrl}
                  width="2rem"
                  height="2rem"
                  style={
                    manageOrganization.iconUrl ? { marginRight: '1rem' } : {}
                  }
                />
                {manageOrganization.name}
                {manageOrganization.subscription?.status ===
                  SubscriptionStatus.PAYMENT_FAILED && (
                  <ExclamationTriangle
                    color="black"
                    style={{
                      marginLeft: '0.5rem',
                    }}
                    size={18}
                  />
                )}
              </Dropdown.Item>
            )
          })}
        </Dropdown.Menu>
      )}
    </Dropdown>
  )
}

export default ManageOrganizationsDropdown
