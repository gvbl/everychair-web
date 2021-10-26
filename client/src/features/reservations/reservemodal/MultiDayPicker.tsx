import React, { InputHTMLAttributes } from 'react'
import { Button, Form } from 'react-bootstrap'
import DatePicker from 'react-datepicker'
import { isSameDay, today } from '../../../util/date'
import { formatDaysMedium } from '../../../util/text'

interface MultiDayPickerProps {
  onChange: (days: Date[]) => void
  onClose: () => void
  name: string
  multiday: boolean
  days: Date[]
  error?: string
}

const MultiDayPicker = React.forwardRef(
  (
    { onChange, onClose, name, multiday, days, error }: MultiDayPickerProps,
    _
  ) => {
    const datePickerRef = React.createRef<DatePicker>()
    const MultiDayInput = React.forwardRef(
      ({ onClick }: InputHTMLAttributes<HTMLInputElement>, _) => {
        let message = ''
        if (days.length === 1) {
          message = formatDaysMedium(days[0], false)
        } else if (days.length > 1) {
          message = `${days.length} days selected`
        }
        return (
          <>
            <Form.Label>{multiday ? 'Days' : 'Day'}</Form.Label>
            <Form.Control
              readOnly
              placeholder={multiday ? 'Select days' : 'Select day'}
              autoComplete="off"
              value={message}
              onClick={onClick}
              name={name}
              isInvalid={!!error}
              style={{ backgroundColor: 'white' }}
            />
            <Form.Control.Feedback type="invalid">
              {error}
            </Form.Control.Feedback>
          </>
        )
      }
    )

    return (
      <DatePicker
        ref={datePickerRef}
        calendarClassName="unselectable"
        customInput={<MultiDayInput />}
        highlightDates={days}
        selected={days.length > 0 ? days[0] : today()}
        minDate={today()}
        shouldCloseOnSelect={!multiday}
        onCalendarClose={onClose}
        onChange={(date) => {
          if (!(date instanceof Date)) {
            return
          }
          const result = days.find((day) => {
            return isSameDay(day, date)
          })
          if (result) {
            const index = days.indexOf(result)
            days.splice(index, 1)
            onChange([...days])
            return
          }
          if (multiday) {
            onChange([...days, date])
            return
          }
          onChange([date])
        }}
      >
        <div className="text-right" style={{ padding: '1rem' }}>
          <Button
            size="sm"
            onClick={() => datePickerRef.current?.setOpen(false)}
            hidden={!multiday}
          >
            Done
          </Button>
        </div>
      </DatePicker>
    )
  }
)

export default MultiDayPicker
