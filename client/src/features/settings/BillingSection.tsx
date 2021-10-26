import axios from 'axios'
import React, { useState } from 'react'
import { Alert, Button, Table } from 'react-bootstrap'
import CustomerPortal from '../../models/api/CustomerPortal'
import { linkDomain } from '../../util/util'

const BillingSection = () => {
  const [genericError, setGenericError] = useState<string | null>()

  const forwardCustomerPortal = async () => {
    try {
      const { data } = await axios.post<CustomerPortal>(
        '/api/customer-portal-url',
        { returnUrl: `${linkDomain()}/settings` }
      )
      window.location.href = data.url
    } catch (err: any) {
      setGenericError('Unable to access customer portal')
    }
  }

  return (
    <Table className="table-borderless">
      <tbody>
        <tr>
          <td>
            <h3>Billing</h3>
          </td>
        </tr>
        <tr>
          <td className="text-center">
            {genericError && <Alert variant="danger"> {genericError} </Alert>}
            <Button variant="secondary" onClick={forwardCustomerPortal}>
              Manage Billing
            </Button>
          </td>
        </tr>
      </tbody>
    </Table>
  )
}

export default BillingSection
