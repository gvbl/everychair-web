import React, { useState } from 'react'
import { Alert } from 'react-bootstrap'
import { Check2, PersonFill } from 'react-bootstrap-icons'
import Table from 'react-bootstrap/esm/Table'
import { Link, useLocation } from 'react-router-dom'
import EmailConfirmationButton from '../../components/EmailConfirmationButton'
import IconAltImage, { Shape } from '../../components/IconAltImage'
import User, { AuthStrategy } from '../../models/api/User'
import { Loading } from '../../models/Loading'
import { formatNameOrAlternate } from '../../util/text'

interface ProfileSectionProps {
  user: User
}

const ProfileSection = ({ user }: ProfileSectionProps) => {
  const urlLocation = useLocation()

  const [emailConfirmationLoading, setEmailConfirmationLoading] = useState(
    Loading.IDLE
  )

  const {
    authStrategy,
    email,
    emailConfirmed,
    firstName,
    lastName,
    avatarUrl,
  } = user

  return (
    <Table className="table-borderless">
      <tbody>
        <tr>
          <td>
            <h3>Profile</h3>
          </td>
        </tr>
        <tr className="table-separator">
          <td colSpan={2} className="first-column">
            <b>Email</b>
            <p>
              {email}
              <span hidden={emailConfirmed} style={{ marginLeft: '0.5rem' }}>
                (Unconfirmed)
              </span>
            </p>
            {authStrategy === AuthStrategy.LOCAL && !emailConfirmed && (
              <>
                {emailConfirmationLoading === Loading.SUCCEEDED && (
                  <>
                    <Alert
                      variant="success"
                      style={{ display: 'inline-block' }}
                    >
                      Email sent, check your inbox.
                    </Alert>
                    <br />
                  </>
                )}
                {emailConfirmationLoading === Loading.FAILED && (
                  <>
                    <Alert variant="danger" style={{ display: 'inline-block' }}>
                      Unable to send confirmation.
                    </Alert>
                    <br />
                  </>
                )}
                <EmailConfirmationButton
                  size="sm"
                  onLoadingChanged={setEmailConfirmationLoading}
                  style={{ marginBottom: '1rem' }}
                />
              </>
            )}
            <div hidden={!emailConfirmed} style={{ marginBottom: '1rem' }}>
              Confirmed <Check2 style={{ color: 'green' }} />
            </div>
          </td>
        </tr>
        <tr
          className="table-separator"
          hidden={authStrategy === AuthStrategy.GOOGLE}
        >
          <td colSpan={2} className="first-column">
            <b>Password</b>
            <p>
              <Link to={`${urlLocation.pathname}/change-password`}>
                Change password
              </Link>
            </p>
          </td>
        </tr>
        <tr className="table-separator">
          <td className="first-column">
            <b>Name</b>
            <p>
              <span
                dangerouslySetInnerHTML={{
                  __html: formatNameOrAlternate(
                    '<i>Not provided<i/>',
                    firstName,
                    lastName
                  ),
                }}
              />
            </p>
          </td>
          <td className="text-right">
            <Link to={`${urlLocation.pathname}/edit-name`}>Edit</Link>
          </td>
        </tr>
        <tr>
          <td className="first-column">
            <b>Avatar</b>
            <div style={{ marginTop: '0.5rem' }}>
              <IconAltImage
                title="Avatar"
                src={avatarUrl}
                width="5rem"
                height="5rem"
                icon={<PersonFill color="white" size={48} />}
                shape={Shape.RoundedCircle}
              />
            </div>
          </td>
          <td className="text-right">
            <Link to={`${urlLocation.pathname}/edit-avatar`}>Edit</Link>
            {avatarUrl && (
              <>
                <br />
                <Link to={`${urlLocation.pathname}/remove-avatar`}>Remove</Link>
              </>
            )}
          </td>
        </tr>
      </tbody>
    </Table>
  )
}

export default ProfileSection
