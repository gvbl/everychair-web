import React from 'react'
import { Address } from '../models/api/Location'
import { formatAddressSecondary } from '../util/text'

interface AddressTextProps {
  address?: Address
  emptyText?: string
}

const AddressText = ({ address, emptyText }: AddressTextProps) => {
  const secondary = formatAddressSecondary(address)
  if (!address) {
    return <>{emptyText}</>
  }
  if (!secondary) {
    return <>{address.street}</>
  }
  return (
    <>
      {address.street}
      <br />
      {secondary}
    </>
  )
}

export default AddressText
