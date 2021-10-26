import React, { InputHTMLAttributes } from 'react'
import { Form } from 'react-bootstrap'
import DatePicker from 'react-datepicker'
import { pastHalfHours } from '../../../util/date'

interface ReserveTimePicker {
  filterBefore?: Date
  onChange: (date: Date) => void
  onClose: () => void
  name: string
  timeCaption: string
  value: Date
  error?: string
}

const ReserveTimePicker = ({
  filterBefore,
  onChange,
  onClose,
  name,
  timeCaption,
  value,
  error,
}: ReserveTimePicker) => {
  const formatReserveTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
    }).format(date)
  }

  const TimeInput = React.forwardRef(
    ({ onClick }: InputHTMLAttributes<HTMLInputElement>, _) => {
      return (
        <>
          <Form.Control
            readOnly
            autoComplete="off"
            value={value ? formatReserveTime(value) : undefined}
            onClick={onClick}
            name={name}
            isInvalid={!!error}
            style={{ backgroundColor: 'white' }}
          />
          <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
        </>
      )
    }
  )
  return (
    <DatePicker
      onChange={onChange}
      onCalendarClose={onClose}
      customInput={<TimeInput />}
      timeCaption={timeCaption}
      openToDate={filterBefore}
      excludeTimes={filterBefore ? pastHalfHours(filterBefore) : []}
      selected={value}
      showTimeSelect
      showTimeSelectOnly
      timeIntervals={30}
      dateFormat="h:mm aa"
    />
  )
}

export default ReserveTimePicker
