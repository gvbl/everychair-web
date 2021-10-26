import { yupResolver } from '@hookform/resolvers/yup'
import _ from 'lodash'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, ButtonGroup, Dropdown, Form } from 'react-bootstrap'
import { Controller, NestedValue, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import * as yup from 'yup'
import { AppDispatch } from '../../..'
import LoadingButton from '../../../components/LoadingButton'
import LoadingModal from '../../../components/LoadingModal'
import GenericModal from '../../../components/modals/GenericModal'
import Desk from '../../../models/api/Desk'
import Location from '../../../models/api/Location'
import Membership from '../../../models/api/Membership'
import Organization from '../../../models/api/Organization'
import Reservation from '../../../models/api/Reservation'
import Space from '../../../models/api/Space'
import { isLoading, Loading } from '../../../models/Loading'
import { reviveReservations } from '../../../models/revive'
import { RootState } from '../../../store'
import {
  beginningOfDay,
  endOfDay,
  isBeforeBOD,
  isBeforeEOD,
  isUpcomingDay,
  isUpcomingTime,
  lastHalfHour,
  now,
  today,
  tomorrow,
} from '../../../util/date'
import { addServerErrors } from '../../../util/errors'
import { generateDeskConflictMap } from '../../../util/reserve'
import { fetchDesks } from '../../desks/desksSlice'
import { fetchLocations } from '../../desks/locationsSlice'
import { fetchSpaces } from '../../desks/spacesSlice'
import { addReservation, fetchReservations } from '../reservationsSlice'
import { autoForward } from '../util'
import DeskSelector, { DeskSelectorIds } from './DeskSelector'
import MultiDayPicker from './MultiDayPicker'
import ReserveInitialState from './ReserveInitialState'
import ReserveTimePicker from './ReserveTimePicker'

export interface ReserveData {
  organizationId?: string
  locationId?: string
  spaceId?: string
  deskId?: string
  body: {
    days: Date[]
    startTime: Date
    endTime: Date
  }
}

interface ReserveFormData {
  days: NestedValue<Date[]>
  startTime: Date
  endTime: Date
  ids: DeskSelectorIds
}

const schema = yup.object().shape({
  days: yup
    .array<Date>()
    .min(1, 'One or more days required')
    .test('days-upcoming', 'Days must be upcoming', (value) => {
      if (!value) {
        return false
      }
      for (let i = 0; i < value.length; i++) {
        if (!isUpcomingDay(new Date(value[i]))) {
          return false
        }
      }
      return true
    }),
  startTime: yup
    .date()
    .required('Start time is required')
    .nullable()
    .test(
      'after-start-time',
      'Start time must be before end time',
      function (value) {
        const startTime = value as Date | null
        if (!startTime) {
          return false
        }
        const endTime = this.resolve(yup.ref('endTime')) as Date | null
        if (!endTime) {
          return true
        }
        return startTime.getTime() < endTime.getTime()
      }
    ),
  endTime: yup
    .date()
    .required('End time is required')
    .nullable()
    .test(
      'after-start-time',
      'End time must be after start time',
      function (value) {
        const endTime = value as Date | null
        if (!endTime) {
          return false
        }
        const startTime = this.resolve(yup.ref('startTime')) as Date | null
        if (!startTime) {
          return true
        }
        return startTime.getTime() < endTime.getTime()
      }
    )
    .test('end-time-upcoming', 'End time must be upcoming', function (value) {
      if (!value) {
        return false
      }
      const days = this.resolve(yup.ref('days')) as Date[]
      if (days.length === 0) {
        return true
      }
      const firstDay = days.sort((a, b) => a.getTime() - b.getTime())[0]
      firstDay.setHours(value.getHours(), value.getMinutes(), 0, 0)
      if (isUpcomingTime(firstDay)) {
        return true
      }
      return false
    }),
  ids: yup.object().shape({
    deskId: yup.string().required('Desk is required'),
  }),
})

interface ReserveSelected {
  organizationsMap: Record<string, Organization>
  locationsMap: Record<string, Location>
  spacesMap: Record<string, Space>
  desksMap: Record<string, Desk>
  reservationsLoading: Loading
  locationsLoading: Loading
  spacesLoading: Loading
  desksLoading: Loading
}

const ReserveModal = () => {
  const history = useHistory()
  const dispatch = useDispatch<AppDispatch>()
  const urlLocation = useLocation<ReserveInitialState>()
  const organizationIds = useRef<string[]>([])
  const cleaningMap = useRef<Record<string, boolean>>({})
  const reservations = useRef<Reservation[]>([])
  const desks = useRef<Desk[]>([])

  const {
    control,
    handleSubmit,
    errors,
    setError,
    formState,
    reset,
    trigger,
    setValue,
    watch,
  } = useForm<ReserveFormData>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
  })

  const [multiday, setMultiday] = useState(false)
  const [genericError, setGenericError] = useState<string | null>()

  const {
    organizationsMap,
    locationsMap,
    spacesMap,
    desksMap,
    reservationsLoading,
    locationsLoading,
    spacesLoading,
    desksLoading,
  } = useSelector<RootState, ReserveSelected>((state) => {
    const organizationsMap = _.mapValues<Membership>(
      state.memberships.entity,
      'organization'
    )
    organizationIds.current = Object.keys(organizationsMap)
    cleaningMap.current = _.mapValues<Organization>(
      organizationsMap,
      'cleaning'
    )
    reservations.current = reviveReservations(
      Object.values(state.reservations.entity)
    )
    desks.current = Object.values(state.desks.entity)

    return {
      reservations: reviveReservations(
        Object.values(state.reservations.entity)
      ),
      organizationsMap: organizationsMap,
      cleaningMap: _.mapValues<Organization>(organizationsMap, 'cleaning'),
      locationsMap: state.locations.entity,
      spacesMap: state.spaces.entity,
      desksMap: state.desks.entity,
      reservationsLoading: state.reservations.loading,
      locationsLoading: state.locations.loading,
      spacesLoading: state.spaces.loading,
      desksLoading: state.desks.loading,
    }
  })

  useEffect(() => {
    dispatch(fetchReservations(organizationIds.current))
    dispatch(fetchLocations(organizationIds.current))
    dispatch(fetchSpaces(organizationIds.current))
    dispatch(fetchDesks(organizationIds.current))
  }, [organizationIds, dispatch])

  const defaults = {
    days: urlLocation.state ? urlLocation.state.days : [],
    startTime: urlLocation.state ? urlLocation.state.startTime : null,
    endTime: urlLocation.state ? urlLocation.state.endTime : null,
    ids: urlLocation.state
      ? {
          organizationId: urlLocation.state.organizationId,
          locationId: urlLocation.state.locationId,
          spaceId: urlLocation.state.spaceId,
          deskId: urlLocation.state.deskId,
        }
      : autoForward(
          {},
          Object.values(organizationsMap),
          Object.values(locationsMap),
          Object.values(spacesMap),
          Object.values(desksMap)
        ),
  }

  const days = watch('days', defaults.days)
  const startTime = watch('startTime', defaults.startTime ?? undefined)
  const endTime = watch('endTime', defaults.endTime ?? undefined)
  watch('ids', defaults.ids)

  const deskConflictMap = useMemo(
    () =>
      generateDeskConflictMap(
        days,
        startTime,
        endTime,
        cleaningMap.current,
        reservations.current,
        desks.current
      ),
    [days, startTime, endTime]
  )

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset()
    }
  }, [formState.isSubmitSuccessful, reset])

  const submit = async (formData: ReserveFormData) => {
    setGenericError(null)
    const reserveData = {
      organizationId: formData.ids.organizationId,
      spaceId: formData.ids.spaceId,
      locationId: formData.ids.locationId,
      deskId: formData.ids.deskId,
      body: {
        days: formData.days,
        startTime: formData.startTime,
        endTime: formData.endTime,
      },
    }
    const resultAction = await dispatch(addReservation(reserveData))
    if (addReservation.fulfilled.match(resultAction)) {
      const reservation = Object.values(resultAction.payload)[0]
      history.push(
        `/reservations/${reservation.id}/days/${reservation.timeRanges[0].id}`
      )
    } else if (addReservation.rejected.match(resultAction)) {
      const serverErrors = resultAction.payload
      if (serverErrors) {
        addServerErrors<ReserveFormData>(serverErrors, setError)
        return
      }
      setGenericError('Unable to submit reservation')
    }
  }

  if (
    isLoading(reservationsLoading) ||
    isLoading(locationsLoading) ||
    isLoading(spacesLoading) ||
    isLoading(desksLoading)
  ) {
    return <LoadingModal title="Reserve" />
  }
  if (
    reservationsLoading === Loading.FAILED ||
    locationsLoading === Loading.FAILED ||
    spacesLoading === Loading.FAILED ||
    desksLoading === Loading.FAILED
  ) {
    return <LoadingModal title="Reserve" error />
  }
  return (
    <GenericModal
      title="Reserve"
      footer={
        <LoadingButton
          type="submit"
          loading={formState.isSubmitting}
          onClick={() => handleSubmit(submit)()}
        >
          Submit
        </LoadingButton>
      }
      show
      scrollable={true}
      onHide={() => {
        reset()
        setGenericError(null)
      }}
    >
      {genericError && <Alert variant="danger">{genericError}</Alert>}
      <Form>
        <Form.Row style={{ flexWrap: 'nowrap' }}>
          <Form.Group controlId="days">
            <Controller
              render={({ onChange, name, value }) => (
                <MultiDayPicker
                  onChange={onChange}
                  onClose={() => {
                    trigger(['days'])
                  }}
                  name={name}
                  multiday={multiday}
                  days={value}
                  error={errors.days?.message}
                />
              )}
              control={control}
              name="days"
              defaultValue={defaults.days}
            />
          </Form.Group>
          <div style={{ marginLeft: '1rem', marginTop: '2.15rem' }}>
            <Dropdown as={ButtonGroup} size="sm">
              <Dropdown.Toggle variant="secondary">Presets</Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  hidden={!isBeforeBOD()}
                  onClick={() => {
                    setValue('days', [today()])
                    setValue('startTime', beginningOfDay())
                    setValue('endTime', endOfDay())
                    trigger(['days', 'startTime', 'endTime'])
                  }}
                >
                  Today
                </Dropdown.Item>
                <Dropdown.Item
                  hidden={!isBeforeEOD()}
                  onClick={() => {
                    setValue('days', [today()])
                    setValue('startTime', lastHalfHour(now()))
                    setValue('endTime', endOfDay())
                    trigger(['days', 'startTime', 'endTime'])
                  }}
                >
                  To EOD
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    setValue('days', [tomorrow()])
                    setValue('startTime', beginningOfDay())
                    setValue('endTime', endOfDay())
                    trigger(['days', 'startTime', 'endTime'])
                  }}
                >
                  Tomorrrow
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Form.Row>
        <Form.Check
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            if (days.length < 2) {
              setMultiday(event.target.checked)
            }
          }}
          onBlur={undefined}
          checked={multiday}
          type="checkbox"
          label="Multiday"
          id="multiday-checkbox"
          style={{ marginBottom: '0.5rem' }}
        />
        <Form.Row style={{ flexWrap: 'nowrap' }}>
          <Form.Group controlId="startTime" style={{ width: '5.75rem' }}>
            <Form.Label>Times</Form.Label>
            <Controller
              render={({ onChange, name, value }) => (
                <ReserveTimePicker
                  onChange={onChange}
                  onClose={() => {
                    trigger('startTime')
                    if (endTime) {
                      trigger('endTime')
                    }
                  }}
                  name={name}
                  timeCaption="Start"
                  value={value}
                  error={errors.startTime?.message}
                />
              )}
              control={control}
              name="startTime"
              defaultValue={defaults.startTime}
            />
          </Form.Group>
          <span
            style={{
              margin: '2.45rem 0.5rem 0 0.5rem',
            }}
          >
            to
          </span>
          <Form.Group controlId="endTime" style={{ width: '5.75rem' }}>
            <Form.Label style={{ visibility: 'hidden' }}>Times</Form.Label>
            <Controller
              render={({ onChange, name, value }) => (
                <ReserveTimePicker
                  filterBefore={startTime}
                  onChange={onChange}
                  onClose={() => {
                    trigger('endTime')
                    if (startTime) {
                      trigger('startTime')
                    }
                  }}
                  name={name}
                  timeCaption="End"
                  value={value}
                  error={errors.endTime?.message}
                />
              )}
              control={control}
              name="endTime"
              defaultValue={defaults.endTime}
            />
          </Form.Group>
          <div style={{ marginLeft: '1rem', marginTop: '2.15rem' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setValue('startTime', beginningOfDay())
                setValue('endTime', endOfDay())
                trigger(['startTime', 'endTime'])
              }}
              style={{ whiteSpace: 'nowrap' }}
            >
              9-5
            </Button>
          </div>
        </Form.Row>
        <Form.Group controlId="ids">
          <Controller
            render={({ onChange, value }) => (
              <DeskSelector
                onChange={onChange}
                deskConflictMap={deskConflictMap}
                organizationsMap={organizationsMap}
                locationsMap={locationsMap}
                spacesMap={spacesMap}
                desksMap={desksMap}
                value={value}
                error={errors.ids?.deskId?.message}
              />
            )}
            control={control}
            name="ids"
            defaultValue={defaults.ids}
          />
        </Form.Group>
      </Form>
    </GenericModal>
  )
}

export default ReserveModal
