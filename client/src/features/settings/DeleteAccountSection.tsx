import React from 'react'
import { Button, Table } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { useLocation } from 'react-router-dom'

const DeleteAccountSection = () => {
  const urlLocation = useLocation()

  return (
    <>
      <Table className="table-borderless">
        <tbody>
          <tr>
            <td>
              <h3>Delete account</h3>
            </td>
          </tr>
          <tr>
            <td className="text-center">
              <LinkContainer to={`${urlLocation.pathname}/delete-account`}>
                <Button variant="danger">Delete account</Button>
              </LinkContainer>
            </td>
          </tr>
        </tbody>
      </Table>
    </>
  )
}

export default DeleteAccountSection
