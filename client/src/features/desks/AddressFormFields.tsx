import React from 'react'
import { Col, Form } from 'react-bootstrap'
import { Control, Controller, DeepMap, FieldError } from 'react-hook-form'
import { Address } from '../../models/api/Location'

interface AddressFormFieldsProps {
  control: Control<Address>
  errors: DeepMap<Address, FieldError>
  defaults?: Address
}

const AddressFormFields = ({
  control,
  errors,
  defaults,
}: AddressFormFieldsProps) => {
  return (
    <>
      <Form.Row>
        <Form.Group as={Col} controlId="street">
          <Form.Label>Address</Form.Label>
          <Controller
            as={<Form.Control />}
            control={control}
            name="street"
            isInvalid={!!errors.street}
            defaultValue={defaults ? defaults.street : ''}
          />
          <Form.Control.Feedback type="invalid">
            {errors.street?.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} controlId="city">
          <Form.Label>City</Form.Label>
          <Controller
            as={<Form.Control />}
            control={control}
            name="city"
            defaultValue={defaults ? defaults.city : ''}
          />
        </Form.Group>
        <Form.Group as={Col} xs="auto" controlId="state">
          <Form.Label>State</Form.Label>
          <Controller
            as={<Form.Control style={{ width: '4rem' }} />}
            control={control}
            name="state"
            isInvalid={!!errors.state}
            defaultValue={defaults ? defaults.state : ''}
          />
          <Form.Control.Feedback type="invalid">
            {errors.state?.message}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col} xs={12} sm="auto" controlId="zip">
          <Form.Label>Zip</Form.Label>
          <Controller
            as={<Form.Control style={{ width: '7rem' }} />}
            control={control}
            name="zip"
            isInvalid={!!errors.zip}
            defaultValue={defaults ? defaults.zip : ''}
          />
          <Form.Control.Feedback type="invalid">
            {errors.zip?.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Form.Row>
    </>
  )
}

export default AddressFormFields
